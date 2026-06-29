//触发器
/*
* 触发器是与数据库表有关的对象，指在对某张表进行insert，update，delete之前或之后，
* 触发并执行触发器中定义的SQL语句集合
* 触发器的这种特性可以协助应用在数据库端确保数据完整性，日志记录，数据校验等操作
* 使用别名OLD和 NEW来引用触发器中发生改变的记录内容，这与其他数据库是相似的，
* 现在Mysql触发器还只支持行级触发，不支持语句级触发。
* 行级触发比如：在对表进行insert，update，delete操作后影响了5行数据，则触发器会执行5次
* 语句级触发比如：在对表进行insert，update，delete操作后影响了5行数据，但触发器只会执行1次
* 触发器类型：
* INSERT触发器：NEW表示操作的数据表中将要或者已经新增的数据
* UPDATE触发器：OLD表示操作的修改之前的数据，NEW表示操作的将要或者已经更新的数据
* DELETE触发器：OLD表示操作的将要或者已经删除的数据
*!!!!!!可以用new/old.字段名来获取新增或更新的数据的字段值
* 创建触发器
* CREATE TRIGGER 触发器名称
* BEFORE|AFTER INSERT|UPDATE|DELETE -- 指定触发器的类型以及是在操作之前还是之后触发
* ON 表名 FOR EACH ROW -- 指定触发器关联的表以及触发器的级别为行级，Mysql只支持行级触发器
* BEGIN
* trigger_stmts;-- 触发器中的SQL语句
* END
*
* 查看触发器
* SHOW TRIGGERS; -- 查看当前数据库中所有的触发器
* 删除触发器
* DROP TRIGGER [schema_name] 触发器名称;删除指定数据库中的指定触发器，没指定数据库默认当前数据库
*
* */

//INSERT触发器案例
/*
* 通过触发器记录tb_user表的数据变更日志，将变更的日志插入到日志表user_log中，
* 包含增加、修改、删除操作都要记录
* 创建的日志表
create table user_log(
id int(11) not null auto_increment,
operation varchar(20) not null comment'操作类型，insert/update/delete',
operation_time datetime not null comment'操作时间',
operation_id int(11) not null comment'操作的是tb_user表中的哪条数据的id',
operation_param varchar(500) comment'操作的参数',
primary key(`id`),
)engine=innodb default charset=utf8mb4 comment='用户操作日志表';

创建触发器
create Trigger tb_user_insert_trigger
    after insert on tb_user for each row
begin
    insert into user_logs(id, operation, operation_time, operation_id, operation_param) VALUES
    (null,'insert',now(),new.id,
     concat('插入的数据内容为:id=',new.id,'name=',new.name,'phone=',new.phone,'email=',new.email,'profession=',new.profession));
//一旦插入了数据到tb_user表中，触发器会自动执行这个SQL语句，将插入的数据的日志记录到user_log表中
end;

show TRIGGERS ;


* 注意！！！
* 在datagrip左侧是看不到数据库的触发器，但是可以通过SHOW TRIGGERS;查看当前数据库的触发器
此时插入一条数据到tb_user表中，触发器会自动执行，将插入的数据的日志记录到user_log表中
insert into tb_user(id, name, phone, email, profession, age, gender, status, createtime)
VALUES (25,'二皇子','18809091212','erhuangzi@163.com','软件工程',23,'1','1',now());
* */

//UPDATE触发器案例
/*
* 通过触发器记录tb_user表的数据变更日志，将变更前和变更后的数据都插入到日志表user_log中，
* 包含增加、修改、删除操作都要记录
create Trigger tb_user_update_trigger
    after update on tb_user for each row
begin
    insert into user_logs(id, operation, operation_time, operation_id, operation_param) VALUES
    (null,'update',now(),new.id,
     concat('更新前的数据为:id=',old.id,'name=',old.name,'phone=',old.phone,'email=',old.email,'profession=',old.profession,
    '更新后的数据为:id=',new.id,'name=',new.name,'phone=',new.phone,'email=',new.email,'profession=',new.profession));
end;


update tb_user set age = 20 where id = 23;

update tb_user set profession ='会计' where id<=5;
-- 此时因为影响了多条数据，所以触发器会自动执行，将多条数据日志记录到user_log表中
* */

//DELETE触发器案例
 /*
* 通过触发器记录tb_user表的数据变更日志，将变更的日志插入到日志表user_log中，
* 包含增加、修改、删除操作都要记录
create Trigger tb_user_delete_trigger
    after delete on tb_user for each row
begin
    insert into user_logs(id, operation, operation_time, operation_id, operation_param) VALUES
    (null,'delete',now(),old.id,
     concat('删除前的数据为:id=',old.id,'name=',old.name,'phone=',old.phone,'email=',old.email,'profession=',old.profession));
end;

delete from tb_user where id = 25;
 * */

//小结
/*
* 视图(VIEW)：虚拟存在的表，不保存查询结果，只保存查询语句，特点:简单、安全、数据独立
* 存储过程(PROCEDURE):事先定义并存储再数据库中的一段SQL语句的集合，减少网路交互，提高性能，封装重用
* 变量、if、case、参数(in/out/inout)、while、repeat、loop(leave、iterate)、cursor、handler
* 存储函数(FUNCTION)：存储函数是有返回值的存储过程，参数只能是IN类型，存储函数可以被存储过程替代
* 触发器(TRIGGER):可以在对表进行insert、update、delete之前或之后，触发并执行触发器中定义的SQL语句集合
* 保证数据完整性、日志记录、数据校验
*
* */
