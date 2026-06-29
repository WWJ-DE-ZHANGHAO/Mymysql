//存储过程(SQL Procedure，一种脚本编程语言。和Lua语言结构完全一致)
/*
应用程序中操作Mysql数据库时，一个业务逻辑当中可能需要执行多个SQL语句
*当需要执行多个SQL语句时，需要进行多次网络请求，会很耗费性能
此时可以将多个SQL语句封装到一个SQL集合当中，当应用程序需要执行该逻辑时，只需要调用该SQL集合就行，且在Mysql服务器中
可以定义很多这种SQL集合。
存储过程就是，事先经过编译并存储在数据库中的一段SQL语句的集合，调用该存储过程可以简化应用开发者的很多工作
，减少数据在数据库和应用服务器之间的传输，对于提高数据处理的效率是有好处的。
存储过程思想上很简单，就是数据库SQL语句层面的代码封装和复用

总结存储过程的特点:
1、可以封装复用
2、可以接受参数，也可以返回数据
3、减少网络交互，效率提升
*
*
* */
//存储过程的基本语法
/*
*创建存储过程
* create  procedure_name 参数列表(parameter_list)
* 调用存储过程
* call procedure_name([参数列表])
*
* 查看存储过程有两种方式:
*一、SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA='xxx';
* 查询指定数据库的所有存储过程以及状态信息，其中ROUTINES是Mysql中的系统表
* ，存在于Information_Schema数据库中，用where ROUTINE_SCHEMA='xxx'来指定要查询的数据库名称
* 二、SHOW CREATE PROCEDURE p1;
* 查询指定存储过程的定义，即创建时的SQL语句
* 会发现create后面有一个definer = root@`%`。表示存储过程创建者(登录Mysql的用户)
* 小技巧！！！
* 如果是datagrip则，可以直接点击datagrip中的routines(例程)，再点击对应的存储过程，就能看到存储过程的定义
*
*删除存储过程
* drop PROCEDURE [if exists] 存储过程名称 ;
*
* 例如:创建一个存储过程P1
create procedure p1()
begin
select count(*) from student;
end;
* 调用存储过程P1(会执行存储过程当中封装的SQL语句）
call p1();
* */
注意！！！
如果是在命令行中创建存储过程，会报错
create procedure p1()
begin
select count(*) from student;
end;
因为命令行遇到分号;就会认为SQL语句结束了
因此想要在命令行中执行创建存储过程的SQL，需要用到delimiter指定SQL语句的结束符
delimiter $$ ，表示遇到$$时SQL才算结束
create procedure p1()
begin
select count(*) from student;
end$$
再该回去，不然以后都要用$$
delimiter ;


//存储过程的变量
/*
*系统变量是Mysql服务器提供的，不是用户自定义的，属于服务器层面，分为全局变量(GLOBAL)、会话变量(SESSION)
* 全局变量：针对所有会话(像是datagrip中的控制台窗口，一个窗口就是一个会话)都有效的变量
* 会话变量：仅在当前会话有效的变量(类似只在某个方法代码块的局部变量)
*
* 查看系统变量
* show [SESSION | GLOBAL] variables; 查看所有系统变量,
* 级别填SESSION表示查看所有会话变量，GLOBAL表示查看所有全局变量，
* 不选默认是SESSION,查看当前会话的系统变量，以下同样
* show [SESSION | GLOBAL] variables like '变量名'; 可以通过LIKE模糊匹配的方式查找变量
* select @@ [SESSION | GLOBAL] 系统变量名; 查看指定变量的值。
* 例如:select @@autocommit;
* 如果要查询全局变量中的autocommit，则需要加上@@global.变量名，即select @@global.autocommit;
*
* 设置系统变量
* set [SESSION | GLOBAL] 系统变量名=值;
* 如果是SESSION级别，设置的变量只会在当前会话有效，对其他的会话无影响
* 例如:set @@autocommit=0;只会将当前会话的autocommit变量设置为0，
* 其他的会话中的autocommit变量不受影响，依旧是原来的值
* 还可以测试一下，是否真的生效了，可以向表中插入数据，看是否会自动提交，
* 如果执行SQL表中没有显示数据说明没有提交
*
* set @@[SESSION | GLOBAL]系统变量名=值;
*
* */
注意！！
设置的是全局变量查看时就必须用@@global.变量名，进行查看
否则默认查看的时候查看的是会话变量

以上的修改系统变量只是临时修改，重启服务器后，这些修改都会被恢复
想要永久修改系统变量，需要修改Mysql的配置文件my.cnf

//用户自定义变量
/*
* 用户自定义变量使用户根据需要自己定义的变量，用户变量不用提前声明，在用的时候直接@"变量名"使用就可以
* 其作用域为当前连接即当前会话(在会话中自定义的变量，其他会话中无法访问)
*
* 赋值
* SET @变量名=值 [,@变量名=值]……;前三个都是可以一次定义多个变量的
* SET @变量名:=值 [,@变量名:=值];
* SELECT @变量名:=值 [,@变量名:=值];
* SELECT 字段名 INTO @变量名 FROM 表名;即将表中的字段值赋给变量
* 表名后需要加上where条件
* 即:select name INTO @course_name FROM course where id=3;
* ！！！！！！
* 一个现象，当id超过表的最大值时，因为获取到的是空值。所以会保留该变量上一次的旧值，比如表中id最大为4
* 当where id=5时，select @course_name;时，返回的是id为3的值
* 使用
* SELECT @变量名[,@变量名];可以一次获取多个变量的值
*
* 建议使用SET @变量名:=值;，便于和等值运算符进行区分
*
* */
注意！！！
用户自定义变量。要用的时候直接@变量名就行，无论在哪都不需要提前声明
//局部变量
/*
*局部变量是根据需要定义的在局部生效的变量，访问前，需要DECLARE声明，可用作存储过程内的局部变量和输入参数，
* 局部变量的范围是在其内声明的BEGIN……END块
* 声明
* DECLARE 变量名 数据类型 [DEFAULT 值];
* 变量类型包括:INT、BIGINT、CHAR、VARCHAR、DATE、TIME等
* 赋值
* SET 变量名 = 值;
* SET 变量名 := 值;
* SELECT 变量名 INTO 变量名 FROM 表名;
*  使用
* SELECT 变量名[,变量名];
*
* 且多次赋值，只有最后一次的值会生效，其他的会被覆盖
* 例如:
create procedure p2()
begin
declare stu_count int default 0;
select count(*) into stu_count from student;
set stu_count:=100;
select stu_count;
end;
call p2();
* */

//if条件判断
/*
* 语法:
* IF 条件1 THEN
* 	执行语句1;
* ELSEIF 条件2 THEN
*   执行语句2;
* ELSE
*   执行语句3;
* END IF;
* 就是if...elseif...else的简写，条件一成立就行执行语句1，条件二成立就执行语句2，否则执行语句3
* 最后执行END IF;结束
* 案例:
* 根据定义的分数score变量，判定当前分数对应的分数等级
* score>=85分，等级为优秀
* score>=60分且score<85分等级为及格
* score<60分等级为不及格
*
 create procedure p3()
 begin
 declare score int default 58;
 declare grade varchar(10);
 if score>=85 then
  set grade:='优秀';
 elseif score>=60 then
 set grade:='及格';
 else
 set grade:='不及格';
 end if;
 select grade;//显示等级
 end;
 call p3();
 * 判断58 分数对应的等级
 *
 * 此时还有的问题就是:
 * 只能在创建存储过程的时候，定义变量值，无法通过参数进行传递，
 * 最后得到的结果无法返回，只能在存储过程中使用select grade;显示等级
* */

//参数
/*
* 存储过程的参数分为三种:IN，OUT，INOUT
* IN:输入参数，调用存储过程时传入的值(默认)
* OUT:输出参数，也就是该参数可以作为返回值
* INOUT:既可以作为输入参数，也可以作为输出参数
* 用法:
* create procedure procedure_name([IN | OUT | INOUT] 参数名 数据类型)，不写默认为IN
*  begin
*  ………………SQL语句
* end;
* 案例一:
* 根据传入参数score 判定当前分数对应到的分数等级，并返回
* score>=85分，等级为优秀
* score>=60分且score<85分等级为及格
* score<60分等级为不及格
* 此时需要在调用存储过程时，传入参数score，并且不再是用select grade;显示等级，
* 而是通过输出参数grade返回等级
*
create procedure p4(in score int,out grade varchar(10))
begin
if score>=85 then
set grade:='优秀';
elseif score>=60 then
set grade:='及格';
else
set grade:='不及格';
end if;
end;
call p4(58,@grade);一旦调用存储过程， 会将存储过程的返回值赋给@grade变量
select @grade;显示等级

*
* 案例二
将传入的二百分制的分数，进行换算成百分制，然后返回，这需要是传入和传出的是同一个变量，只是除换算的分数为百分制，即除2
* 要满足这个条件，需要将参数定义为INOUT
create procedure p5(inout score double)
begin
set score:=score/2;
end;
call p5(@score);
select @score;

set @score =14.4;
call p5(@score);//将变量值传入存储过程，进行换算，最后将换算后的值返回给变量
select @score;

*
* */

//case
/*
* 语法一:
* CASE case_value
* WHEN when_value1 THEN statement_list
* [WHEN when_value2 THEN statement_list]...
* [ELSE statement_list]
* END CASE;
* //case_value为一个变量，其值与下面的各个when_value进行比较，如果相等则执行下面的statement_list
* 如果都不相等，则执行ELSE中的statement_list
* 语法二:
* CASE
* WHEN search_condition1 THEN statement_list
* [WHEN search_condition2 THEN statement_list]...
* [ELSE statement_list]
* END CASE;
* //search_condition为条件，如果条件成立则执行statement_list
* 如果都不成立，则执行ELSE中的statement_list
*
* 案例:
* 根据传入的月份，判断月份所属的季节
* 1-3月为第一季度
* 4-6月为第二季度
* 7-9月为第三季度
* 10-12月为第四季度
*
create procedure p6(in month int,out season varchar(10))
begin
    CASE
    WHEN  month<=3&&month>=1 THEN set season :='第一季度';
    WHEN  month<=6&&month>=4 THEN set season :='第二季度';
    WHEN  month<=9&&month>=7 THEN set season :='第三季度';
    WHEN  month<=10&&month>=12 THEN set season :='第四季度';
    ELSE set season:='输入的月份有误';
    end case;
end;

call  p6(0,@season);
select @season;
* */
注意！！！
concat函数是Mysql的字符串拼接函数，类似于Java中的StringBuilder.append()方法
当不用输出参数时，可以直接在存储过程当中使用select语句显示结果
例如:select concat('您输入的分数为：',score,'，对应的分数等级为：',grade);
Mysql条件中&&和and的作用是一样的，都是表示逻辑与

//while循环
/*
* while循环是有条件的循环控制语句，满足条件后，再执行循环体中的SQL语句
* 语法:
* WHILE 条件 DO //先判断条件，如果条件为true则执行do后面的SQL语句，否则不执行逻辑
*  SQL逻辑
* END WHILE;
*
* 案例:
* 计算1累加到n的值，n为输入的参数值
create procedure p7(in n int,out sum int)
begin
declare total int default 0;
while n>0 do
set total:=total+n;
set n:=n-1;
end while;
set sum:=total;
end;
call p7(10,@sum);
select @sum;
*！！！！！！
* 大大注意！！！
* 如果只是声明了sum，它的值是nul，null加什么都是 null
* 需要提前定义变量total，让total累加，最后将total的值赋给sum
* */

//repeat循环
/*
* repeat是有条件的循环控制语句，但满足条件的时候退出循环，具体语法
* REPEAT
* SQL逻辑
* UNTIL 条件 //先执行SQL逻辑，再判断UNTIL条件，如果条件为true则退出循环，否则继续执行SQL逻辑
* END REPEAT;
* 类似do...while，无论条件是否满足，都会执行一次SQL逻辑
*
* 案例:
* 计算1累加到n的值，n为输入的参数值
create procedure p8(in n int,out sum int)
begin
declare total int default 0;
repeat
set total:=total+n;
set n:=n-1;
until n<=0
end repeat;
set sum:=total;
end;
call p8(10,@sum);
select @sum;
* */


//loop循环
/*
* LOOP实现简单循环，如果不在SQL逻辑中增加退出循环的条件，可以用其来实现简单的死循环，LOOP可以配合以下两个语句使用
* LEAVE:配合循环使用，退出循环
* ITERATE:必须用在循环中，作用是跳过当前循环剩下的语句，直接进入下一次循环。
* 语法:
[begin_label:]LOOP //[begin_label:]是自定义的循环的开始标记，end_label是循环的结束标记，
也就是循环的名字
* SQL逻辑
  END LOOP [end_label]
 需要加上
LEAVE lable; 退出循环 label是循环的名字
ITERATE lable; 跳过当前循环剩下的语句，直接进入下一次循环，label是循环的名字
*
* 案例一:
* 计算从累加到n的值，n为输入的参数值
create procedure p9(in n int,out sum int)
begin
declare total int default 0;
sum:loop  --给循环一个名字sum
if n<=0 then -- 先判断条件
LEAVE sum;
end if;
set total:=total+n;
set n:=n-1;
end loop sum ;
set sum:=total;
end;
call p9(10,@sum);
select @sum;
* 案例二:
* 计算从1到n之间的偶数累加的值，n为传入的参数值。即只加2、4、6、8…………，1、3、5、7…………不加
create procedure p10(in n int,out sm int)
begin
declare total int default 0;
SUM:loop  -- 给循环一个名字SUM
if n<=0 then -- 先判断条件
LEAVE SUM;
end if;
if n%2=1 then -- 判断n是否为奇数，如果是奇数则跳过当前循环剩下的语句，直接进入下一次循环
set n:=n-1; -- 一定要减一，再进入下一次循环，否则会一直是奇数，导致死循环
ITERATE SUM;
end if;
set total:=total+n;
set n:=n-1;
end loop SUM ;
set sm:=total;
end;
call p10(10,@sm);
select @sm;
*
* */

//cursor游标
/*
* 像之前的存储过程将查询表的结果给一个局部变量
* create procedure p11(out stu_name varchar(20))
*  begin
declare stu_count int default 0;
select count(*) into stu_count from student;
select stu_count;
* end;
* 但是现在想改变，让select * from student的结果，保存在局部变量stu_count中
* 会发现无法调用，因为stu_count是一个Int类型的变量，无法接受一张表或者一个结果集的数据
* !!!
* 此时就需要用到游标cursor
* 游标(cursor)是用来存储查询结果集的数据类型，在存储过程和函数中可以使用游标对结果集进行循环处理、
* 游标的使用包括游标的声明、OPEN、FETCH和CLOSE
* 语法:
* 声明游标
* DECLARE cursor_name CURSOR FOR select_statement;//select_statement为查询语句
* 将该查询语句到的结果集保存在游标cursor_name中
*
* 打开游标(使用前必须打开游标)
* OPEN cursor_name;
*
* 获取游标中的记录
* FETCH cursor_name INTO variable_list;或FETCH cursor_name INTO 变量1[,变量2]……;
* //variable_list为变量列表，游标中的每一行数据会依次赋值给变量列表中的变量
*
* 关闭游标(使用完游标后必须关闭游标)
* CLOSE cursor_name;
*
* 案例:
* 根据传入的参数uage、来查询用户表tb_user中,所有的用户年龄小于等于uage的用户的profession和name，
* 并将用户的姓名和专业插入到所创建的一张新表(id,name,profession)中

create procedure p11(IN uage int)
begin
    declare  uname varchar(100);
    declare  upro varchar(100);
    declare user_cursor CURSOR FOR select profession,name from tb_user where age<=uage;
    create table if not exists  tb_user_pro(
        id int primary key auto_increment,
        name varchar(100),
        profession varchar(100));
    OPEN user_cursor;
    while true do -- 当游标中的内容获取完之后就跳出循环
     FETCH user_cursor INTO uname,upro;
     insert into tb_user_pro values(null,uname,upro);
    END while;

    CLOSE user_cursor;
end;
call p11(40);

！！！发现会报错 No data - zero rows fetched, selected, or processed
因为while一直循环，当游标cursor没有数据时，
，此时会报No data - zero rows fetched, selected, or processed
但是要怎么知道游标cursor没有数据，让给while循环的条件设置为游标用完呢？
 */

注意！！！
变量声明要在游标声明之前
//为了解决不知道什么时候cursor游标没有数据,导致报错的问题，有了条件处理程序
/*
* 条件处理程序(Handler)
* 条件处理程序可以用来定义在流程控制结构执行过程中遇到问题时相应的处理步骤，具体语法：
* DECLAR handler_actoin HANDLER FOR condition_value[condition_value]...sratement;
* 当满足condition_value时，执行hanlder_action再执行statement语句
* 其中
* handler_action的动作有两种:
* CONTINUE:继续执行流程
* EXIT:退出当前流程控制结构，比如while、loop、repeat
*
* condition_value的状态码如下:
* SQLSTATE sqlstate_value:执行SQL抛出的状态码，如02000，
* SQLWARNING:警告,所有01开头的SQLSTATE代码的简写
* NOT FOUND:没有找到，所有02开头的SQLSTATE代码的简写
* SQLEXCEPTION:异常，所有没有被SQLWARNING或NOT FOUND所匹配的SQLSTATE代码的简写
* 例如:declare exit handler for sqlstate '02000' close user_cursor;
* 当执行SQL语句后抛出02000状态码时，执行退出语句，并关闭游标close user_cursor;
*
* 完善上面的存储过程的游标cursor的使用
create procedure p11(IN uage int)
begin
    declare  uname varchar(100);
    declare  upro varchar(100);
    declare user_cursor CURSOR FOR select profession,name from tb_user where age<=uage;
    declare exit handler for sqlstate '02000' close user_cursor;
//当SQL逻辑执行过程中，因为游标cursor已经找不到数据报错，所以是状态码是SQLSTATE '02000'被抛出，
则执行退出语句，并关闭游标close user_cursor，因为将报错处理了，就不会再报错了
    create table if not exists  tb_user_pro(
        id int primary key auto_increment,
        name varchar(100),
        profession varchar(100));
    OPEN user_cursor;
    while true do -- 当游标中的内容获取完之后就跳出循环
     FETCH user_cursor INTO uname,upro;
     insert into tb_user_pro values(null,uname,upro);
    END while;

    CLOSE user_cursor;
end;

call p11(40);
* 此时再次调用存储过程，发现没有报错
* */
注意！！！
状态码也可以直接用NOT FOUND来代替SQLSTATE '02000'，因为NOT FOUND是所有02开头的SQLSTATE代码的简写

//存储函数
/*
* 存储函数是有返回值的存储过程，存储函数的参数只能是IN类型的，具体语法:
* create function function_name([参数列表]) -- 参数列表只能是IN类型的参数，不写也是IN类型的参数
* RETURNS type [characteristic……] 返回值的类型，characteristic是存储函数的特性
*  begin
* SQL语句
* RETURN……；
* end;
*
* 其中characteristic包括:
* DETERMINISTIC:相同的输入参数总是产生相同的结果
* NO SQL:表示存储函数中不能有SQL语句
* READS SQL DATA:包含读取数据的语句，但不包含写入数据的语句。
*
* 案例:
* 通过存储函数计算从1累加到n的值，n为传入的参数值
create function fn1(n int)
returns int deterministic
begin
declare total int default 0;
while n>0 do
set total:= total+n;
set n :=n-1;
end while;
return total;
end;
select fn1(10); 直接用函数名就可以调用，用select显示结果
 */
* */
注意！！！
必须指定存储函数的函数特性，否则无法执行成功
大大注意！！
存储函数名称不能用系统函数例如sum、count、avg等作为存储函数的名称，否则会报错