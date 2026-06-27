//视图
/*
* 视图(view)是一种虚拟存在的表，视图中的数据并不在数据库中实际存在，行和列数据来自定义视图的查询中使用的表
* ，并且是在使用视图时动态生成。
* 通俗来讲，视图只保存了查询的SQL逻辑，不保存查询结果，所以我们在创建视图的时候，
* 主要的工作就是落在创建这条SQL查询语句上。
*
* 创建视图:
* CRATE [OR REPLACE] VIEW 视图名称[(列名列表)] AS SELECT查询语句 [WITH [CASCADED | LOCAL] CHECK OPTION]
* OR REPLACE:表示可以创建视图或用创建的替换原有的视图
* SELECT查询语句查询的表就是视图关联的基础表，视图中封装的数据就来自于查询语句的结果集
* 在DataGrip的控制台中编写
* create or replace view view_name as select id,name from tb_user where id<=10;
* 创建完之后，会发现在itcast数据库中多了一个视图view_name，点击视图可以看到里面的数据是从tb_user表中查询出来的
*
* 查询视图:
* 查看创建视图的语句:SHOW CREATE VIEW 视图名称;
* 查看视图数据:SELECT * FROM 视图名称…………;(将视图当成一张表去查询)
*
* 修改视图:
* 方式一:CREATE [OR REPLACE] VIEW 视图名称 AS SELECT 查询语句 [WITH [CASCADED | LOCAL] CHECK OPTION;
* 修改查询语句的结果集，用新的视图替换掉原来的视图
* 方式二:ALTER VIEW 视图名称 AS SELECT 查询语句 [WITH [CASCADED | LOCAL] CHECK OPTION;
* 直接修改视图的查询语句
*
* 删除视图:
* DROP VIEW [if exists]视图名称;
* */
注意！！！
表中的非空字段不能为空，insert插入数据时，values()中必须包括所有非空字段的值，否则会报错
//检查选项
/*
*给视图中添加数据时，因为视图中并不存储数据，而是插入到视图关联的基础表中了。
* 视图只会执行SQL语句，像是点击视图这张表时，
* 会执行select * from view_name;而视图view_name又是AS一个select语句
* 所以执行的相当于是select * from (select id,name from tb_user where id<=10)
*
* 当添加的数据的Id大于10时，则视图中不会显示该新插入的数据行，
* 例如:insert into view_name values(25,'钟馗');
* 因为视图关联的select语句的结果集中。只有id<=10的记录

* 为此就有了WITH CASCADED CHECK OPTION/WITH LOCAL CHECK OPTION检查选项，
* 检查选项会对要插入的数据进行检查，
* 如果插入的数据不满足建立视图时的select查询语句的WHERE条件，则插入数据时会失败，组织该条数据插入基础表中
* 会报错:CHECK OPTION failed 'itcast.view_name'
*
* 修改视图:将末尾带上WITH CASCADED CHECK OPTION检查选项，
* create or replace view view_name as select id,name from tb_user
* where id<=10 with CASCADED check option;
*
* 具体描述:
* 当使用with check option子句创建视图时，Mysql会通过视图检查正在更改的每个行，例如:插入，更新，删除
* 以使其符合视图的定义时的条件，Mysql允许基于另一个视图创建视图，为了确定检查的范围。
* Mysql提供了两种检查选项:with cascaded check option和with local check option
*/

// 级联检查With CASCADED CHECK OPTION
/* WITH CASCADED(翻译就是级联) CHECK OPTION:检查所依赖的视图(默认)
* 它会检查要操作的数据是否同时满足当前视图的规则和当前视图所依赖视图中的规则。
* 相当于给所依赖的视图也加上了with cascaded check option
*
* 例如:
* create or replace view V1 as select id,name from tb_user where id<=20;
* create or replace view V2 as select id,name from V1 where id>10 with cascaded check option;
* 此时插入数据:insert into V2 values(15,'张三');
* Mysql会检查插入的数据的id是否满足V2的WHERE条件，以及满足V1的WHERE条件，即10<id<=20
* 如果满足则插入成功，否则会报错

此时再创建一个视图V3依赖于V2，但是V3没有加上with cascaded check option检查选项
* create or replace view V3 as select id,name from V2 where id<=15 ;
*
当插入的数据为17，依然可以正常插入只是V3视图不会显示，会先检查是否满足V3，再检查是否满足V2，
最后检查是否满足V1都满足，则插入成功

！！！但是当插入的数据Id小于10时会被拦截
因为V2视图只接受大于10的数据，且V2视图是加上了with cascaded check option
而V3的数据源是从V2中获取的，小于10的数据插入时会被拦截，无法插入并报错


！！！！当操作的数据的Id大于20时，也将会被拦截。
虽然不满足当前视图V3但是V3并没有加上with cascaded check option，再检查V2，因为V
* WITH LOCAL CHECK OPTION:且还依赖的视图V1，则还需要检查是否满足视图V1，因为无法满足V1导致
插入失败
 */
注意！！！
当视图之间依赖时，插入的数据需要满足当前视图以及其所依赖的视图的条件，不满足也能插入成功
但是！！！！
如果其所依赖的视图加了with cascaded check option检查选项，则必须满足所依赖的视图的条件
如果其所依赖的视图也有依赖的视图，还需要再去检查是否满足其依赖的视图所依赖的视图，则依次类推

// 本地检查With LOCAL CHECK OPTION，只检查当前视图所依赖的视图
/*
*WITH LOCAL CHECK OPTION:检查所依赖的视图(默认)
*创建三个视图V1,V2,V3
* create or replace view V1 as select id,name from tb_user where id<=15;
* create or replace view V2 as select id,name from V1 where id>=10; with local check option;
* create or replace view V3 as select id,name from V2 where id<=20;
* */
注意！！！
当视图添加了with local check option检查选项时，需要检查是否满足当前视图的条件
如果还依赖了视图且所依赖的视图中有条件且也添加了with local check option检查项，
就还需要再检查是否满足所依赖的视图的条件
没有添加with local check option检查项，则只需要满足当前视图的条件就行

当然如果插入的视图没有添加with local check option检查选项，
但是其所依赖的视图有with local check option检查选项，则只需要检查是否满足所依赖的视图的条件就行

//视图更新(插入、删除、更新)
/*
* 视图更新需要满足以下条件：
* 要使视图更新，视图中的行与基础表中的行之间必须存在一对一的关系(比如视图字段id，name:7,'张三'。
* 基础表中只能有一行的id=7且name='张三')
* 如果视图定义时中包含以下的任何一项，则该视图不可更新
* 1、包含聚合函数或窗口函数(SUM()、MIN()、MAX()、COUNT()等)
* 2、包含DISTINCT
* 3、GROUP BY
* 4、HAVING(分组后的过滤)
* 5、UNION或UNION ALL
*
* 例如:
* create or replace view view_name as select count(*) from tb_user;
* 再插入数据时会报错:因为基础表中找不到对应的行，导致视图更新失败
* */

//视图的作用
/*
* 简化:
* 视图不仅可以简化用户对数据的理解，也可以简化他们的操作，那些被经常使用的查询可以被定义成视图，从而使得
* 用户不必为以后的操作，每次都书写复杂的查询条件，只需要操作视图就行了
*
* 安全:
* 数据库可以授权，但不能授权到数据库特定行和特定列上，通过视图用户只能后才查询和修改他们所能见到的数据
* 让用户只看到表的某些字段
*
* 数据独立:
* 视图可以帮助用户屏蔽基础表结构变化，带来的影响
* 比如:基础表中的name字段名变为student_name,只需要修改视图,给student_name字段建立别名就行
* create or replace view view_name as select id,student_name as name from tb_user;
* 就能继续操作
* */

//视图案例
/*
* 1、为了保证数据库的安全性，开发人员在操作tb_user表时，只能看到的用户的基础字段，屏蔽手机号和邮箱两个字段
create view tb_user_view as select id,name,tb_user.profession,age,gender,status,createtime from tb_user;
* 2、查询每个学生所修的课程(三张表联查)，这个功能再很多的业务中都有使用到，为了简化操作，定义一个视图
create or replace view SSC as select s.name student_name,s.no student_no,c.name course_name from student s ,student_course sc,course c where s.id=sc.studentid and c.id=sc.courseid;
* 之后只需要、 select * from SSC;就能获取数据
*
* */
注意！！！！
如果查询列表字段中有多个name像是s.name和c.name，视图中会显示name和name，无法区分是哪个表的name字段，所以需要给字段起别名