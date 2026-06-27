//SQL优化
//数据插入优化
/*
*insert
* 批量插入时不要一条条单独的SQL语句进行数据插入，
* 优化方案一:
* 多条数据使用一条SQL语句进行数据插入，批量插入的SQL语句格式如下:
* insert into 表名(字段1,字段2,字段3...) values(值1,值2,值3...),(值1,值2,值3...),(值1,值2,值3...)
* 但是也不要超过1000条数据
*如果要批量插入超过几万条数据，可以使用多条这个SQL语句进行插入
*优化方案二:
* 手动提交事务，之前都是每执行一条SQL语句就提交一次事务，需要频繁的进行事物的开启和提交
* 手动提交就可以在执行多条SQL语句前开启事务，执行完所有SQL语句后提交事务，这样就减少了事务的开启和提交的次数，提升了性能
*优化方案三:
* 主键顺序插入
* 批量插入数据时，将数据按ID顺序插入，比如从1到10000，这样插入的数据，
* 主键的ID会按照顺序进行递增，这样查询数据时，主键ID的查询效率会更高
* 这三个优化方案同时使用，效果更好
*主键顺序插入性能高于乱序插入

* 大批量插入数据
* 但是如果要插入的数据超过100W条时，那么就不建议使用insert语句进行数据插入了，
* 可以使用MySQL提供的load data命令进行数据插入，一次性可以将本地文件中的数据加载进数据库表，效率更高
 注意！！！！

* 加载的文件中的数据不一定是SQL语句，
* 可能是以逗号分隔的文本数据，或者是以制表符分隔的文本数据，或者是以其他分隔符分隔的文本数据
* 操作步骤:
* 客户端连接服务器时，加上参数--local-infile
* mysql --local-infile -u用户名 -p密码
* 设置全局参数local-infile为1，开启从本地加载文件导入数据的开关
* set global local_infile=1;
* 执行load指令将准备好的数据，加载到表结构中
* load data local infile '文件名' into table 表名 fields terminated by ',' lines terminated by '\n';
*
*  */
注意！！
操作的前两句也可以直接用一句语句完成
docker exec -it mysql mysql -uroot -p123456 --local-infile=1
load数据时，文件中的数据最好也是主键顺序的


//主键优化
/*
* InnoDB存储引擎当中，表数据都是根据主键顺序组织存放的，
* 这种存储方式的表称为索引组织表(index organized table)IOT
* 索引结构中的每一个节点都是一个页/块，页/块中存储着多条数据记录
*
* 每页包含了2到N行数据(如果一行数据过大，会行溢出),且要根据主键排列
* 注意！！！
* 在InnoDB中规定每个页当中必须至少包含两行数据，如果每页只有一行数据的话，那就相当是一个链表了
* 如果某行的数据比较大，超出阈值之后就会出现行溢出
*
* 如果插入数据时是主键顺序插入，
* 当一个页满了，会去申请第二个页存储剩余的数据，两个页之间会用一个双向指针链接起来，
* 下一个插入的数据一定是顺着前面的顺序来插入的。
*
* 页分裂:
* 如果插入数据时是主键乱序插入，
* 因为不是按顺序插入的，当前两个页都存满了
* 分别是
* 第一个节点ID为1、5、9、23、47第二个节点ID为55、67、89、101、107
* 此时要插入一条ID为50的数据行，那么就会去申请第三个页，但是由于叶子节点是要按照主键顺序来排序的，
* 需要将第三个页放在第一页和第二页之间，可以是第一页存放1、5、9第三爷存储23、47、50，第二页不变
* 这样就是要将原先的叶子节点拆开，重新设置链表指针，这就是“页分裂”
* 这会导致每次分裂要读取原页再写到新页，多次的IO访问，性能下降
*
*
*
* 页合并:
* 如果要在InnoDB中删除某行数据，实际上记录并没有被物理删除，只是记录被标记(flaged)为删除了
* 且它的空间变的允许其他记录声明使用
* 当页中被删除的记录数量达到MERGE_THRESHOLD(默认为整个页的50%)时，
* InnoDB会自动开始寻找最靠近的页(前后)看看是否可以将两个页合并以优化空间使用
* 例如:第一节节点ID为1、5、9、23、47
* 第二个节点ID为55、67、89、101、107第三节ID为123、135、147
* 此时删除了第二节点中的89、101、107三条数据，被删除的记录数量已经达到了MERGE_THRESHOLD(50%)，
* 那么InnoDB会自动开始寻找最靠近的页(前后)，发现第三节点中的刚好空闲了两个位置，
* 就可以将第三节的数据放到第二节中，第三节点就去拿不空闲出来了
*
* 主键的设计原则:
* 1、满足业务需求的情况下，尽量降低主键的长度，因为如果主键的长度过长，会导致需要有更多的节点来存储
* 导致空间浪费和查询效率下降
* 2、插入数据时，尽量选择顺序插入，选择使用AUTO_INCREMENT自增主键
* 3、尽量不要使用UUID做主键或者是其他自然主键，例如身份证号
* 4、业务操作时，避免对主键的修改
* */

//order by(排序)优化
/*
*将phone和name字段的索引删除，然后查询tb_user表中的id、age和phone字段并用只有联合索引的age字段order by进行升序排序
* 再用explain计划查看SQL的执行过程，会发现Extra字段的值为Using filesort查询效率低
* explain FORMAT=TRADITIONAL select id,age,phone from tb_user order by age,phone;
* 再根据age和phone进行升序排序，如果age一样就按phone升序排序，
* 再用explain会发现Extra字段的也为Using filesort
*
* 此时对age和phone进行建立联合索引
* create index idx_age_phone on tb_user(age,phone);
* 再用explain查看SQL的执行计划，Extra字段的为Using index，效率明显变高了
*
* 此时再根据age和phone进行降序排序，
* explain FORMAT=TRADITIONAL select id,age,phone from tb_user order by age desc,phone desc;
* 会发现Extra中位Backward index scan; Using index，其中Backward表示反向扫描索引结构
* 因为建立的age和phone的索引结构是，叶子节点中的内容是age、phone以及id
* 这里的反向索引是指，从双向链表的叶子节点的最大值向最小值扫描遍历
*
* 注意！！！
* 查询表中的索引时会发现，有一个Collation字段，值为A表示asc升序排列，D表示desc倒序排列
* 建立索引时默认是升序排列的A
* 如果没按照执行的顺序进行排序，那么Extra会多一个Using filesort排序，表示使用文件排序
*
* 如果查询时where条件是order by phone再age，这就表示先根据phone进行排序，再根据age进行排序。
* 会违反最左前缀法则
* 因为建立索引时age是第一个，phone是第二个，
* 索引结构中需要第一个age相等第二个phone才能进行排序，相当于phone只有在同一个age分组内部有序
* 跨不同的age分组phone是乱序的
*
* 解决方案:
* 想要让根据第一个age进行升序排序，再根据第二个phone进行降序序排序，
* 只需要在建立联合索引的时候，指定字段的排序方式就行
* 例如:create index idx_age_phone_ad on tb_user(age asc,phone desc);
* 此时就有两个联合索引关联age和phone。
* 此时无论查询时两个都是升序排列的，还是一个是升序一个降序都不会出现Using filesort
*
* 此时这个idx_age_phone_ad索引结构如下:
* age asc,phone desc
* 叶子节点中如果age相等，那么就根据phone进行降序排序
* */
注意！！

orderby优化也要遵循覆盖索引，否则Extra也会是Using filesort
按索引查询排序时，是根据oederby的字段已经排好序的索引的结构的叶子节点进行读取的，
当要进行排序的某个字段不在该索引结构中时，需要回表读取额外的字段，且要进行多次回表读取，
造成大量的IO成本消耗变大。
MYsql优化器就会进行评估，直接放弃使用该索引结构，使用Using filesort进行内存排序
例如:
idx(age,phone)
select id,age,phone,name from tb_user order by age,phone;
此时无法走age和phone的索引结构，只能使用Using filesort进行内存排序

当不可避免的出现filesort，大量数据排序时，可以适当的增大排序缓冲区的大小sort_buffer_size(默认为256k)
使用show variables like 'sort_buffer_size'
//group by(分组)优化
/*
*先将所有的索引表删除，然后用profession字段进行分组
* explain FORMAT=TRADITIONAL select profession,count(1) from tb_user group by profession;
* 会发现Extra字段为Using temporary，表示使用临时表性能是比较低的
* 此时再次建立profession、age、status的联合索引
* 再次进行分组查询会发现Extra字段为Using index，也使用了联合索引结构
*
* 但是此时如果时只按照age字段进行分组，会发现Extra字段为Using temporary，表示使用临时表
* explain FORMAT=TRADITIONAL select age,count(1) from tb_user group by age;
* 但是key还是使用了联合索引结构，Extra中也有Using index
* 为什么明明没有满足最左前缀法则，Mysql还是会使用这个联合索引呢？
* 因为要进行分组的列包含着索引结构(B+tree)中符合覆盖索引,Mysql就会使用该联合索引结构，
 从而不用进行回表查询自然就会有Using index
 注意！！！

 这里的临时表，是因为联合索引结构中是先按照profession排序再按age进行排序的，
 没有professionage就是无序的，所以Mysql就没法按照索引的有序性完成分组，只能使用临时表进行分组聚合

 此时只需要加上profession字段就能满足最左前缀法则
 */

注意！！
在Mysql8.0之前违背了最左前缀法则时，Mysql只能进行全表扫描
在Mysql8.0之后:
违背最左前缀索引只是意味着不能利用索引进行快速定位，但是不会禁止使用该联合索引的结构进行查询(扫描联合索引)，
覆盖索引和最左前缀法则是两码事
idx(a,b,c)
select a,b from tb_user where b=1;
因为b所在的联合索引覆盖了要查询的a,b两个字段，此时Mysql依旧会使用b的联合索引结构idx(a,b,c)
//limit(分页查询)优化
/*
*select id,name from tb_user limit 0,10;表示从其实位开始查询10条数据(即一页十条数据，展示第一页的数据)
*如果此时要查询100万行记录开始的10条数据即
* explain FORMAT=TRADITIONAL select id,name from tb_user limit 1000000,10;
* 会发现耗时好几秒的时间，且查询到的数据越靠后耗时越长
*因为Mysql默认是使用全表扫描进行查询的，此时会全表扫描100万行数据，并将前100万丢弃，只返回
* 1000000-1000010，查询的代价很大。
*
* 此时可以通过覆盖索引加上子查询的方式解决
* 例如:
* select id from tb_user where order by id limit 1000000,10;此时就是覆盖索引，
* 会发现确实变快了，因为此时没有进行回表查询
* select * where id in (select id from tb_user order by id limit 1000000,10);
* 注意！！！
* 如果Mysql当前版本不支持，可以是用将子查询结果当成一张表，进行多表查询
 select s.* from tb_sku s,(select id from tb_sku order by id limit 1000000,10) a
  where a.id=s.id;
耗时会更低
* */
//count(聚合)优化
/*
*会发现select count(1) from tb_user;，当数据量很大的时候也是非常的耗时的
* 这就归咎于InnoDB引擎
* MyISAM引擎会把一个表的总行数写在磁盘上，因此执行count(*)的时候直接返回这个数就行，效率很高
* 但前提是查询的时候，后面没有where条件
* InndoDB引擎，它执行count(*)的时候，需要将数据一行行地从引擎里面读取出来，然后累积计数。
* 所以目前没有什么很好的优化方式
*
* 只能通过自己计数来优化:
* 需要借助key-value形式的内存级别的数据库，例如Redis，
* 当向mysql数据库表中插入数据时，将某个计数加一，删除某个数据库表中的某行数据时，将计数减一，
* 自己维护这个计数的值
* count的几种方式:
* 1.count(*):
* InnoDB引擎不会把全部字段取出来，而是做了专门的优化，不取值，服务层直接进行累加
* 2.count(字段):
* 如果该字段加了not null约束，InnoDB引擎会遍历整张表，把每一行的字段值取出来，返回给服务层，
* 服务层拿到字段值后直接进行个数累加。
* 如果该字段没加not null 约束，InnoDB引擎会遍历整张表，把每一行的字段值取出来，返回给服务层，
* 当判断某行数据的该字段值为null，则该行不会被计算在内
* 3.count(主键):InnoDB引擎会遍历整张表，把每行的Id值取出来，返回给服务层，服务层拿到主键后直接进行累加
* (不用判断是否为null，主键不可能为null)
* 4.count(1即常数):InnnoDB引擎遍历整张表，但不取值，服务层对返回的每一行放一个1，
* 然后在服务层进行累加
*
*  总结:
* 效率排行：count(*)=count(1) > count(主键) > count(字段)
* */
//update 优化
/*
*因为InnoDB引擎默认使用的是行级锁(是针对索引加的锁，不是针对改行记录加的，
* 并且该索引不能失效，否则会从行锁变为表锁，并发性能会变低)，当进行update操作时，会锁住整行数据，
* 当一个线程正在更新某行数据时，其他线程不能对该进行写操作，只能进行读操作
* 注意！！！
* 需要开启事务，只有提交行级锁才会释放
* 大大注意！！
* 当表中的某个字段没有建立索引的时候，操作该字段时，使用的是表锁
* 即当一个线程正在操作该字段时，其他线程不能对该字段所在的表进行写操作，只能进行读操作
* */
