--# mysql -u root -p
--# Enter password: 12345Qwert

-- 创建用户
create user 'dev'@'localhost' identified by '12345Qwert';

-- 禁用密码过期功能
ALTER USER 'dev'@'localhost' PASSWORD EXPIRE NEVER;

-- 设置用户密码等级
ALTER USER 'dev'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345Qwert';
FLUSH PRIVILEGES;


-- 查看用户
SELECT User, Host FROM mysql.user;

-- 查看用户权限
show grants for 'dev'@'localhost';

-- 展示所有数据库
show databases;

-- 创建数据库
create database if not exists newyear;

-- 分配权限
grant ALL on newyear.* to 'dev'@'localhost';

-- 使用数据库
use newyear;


create table user (
    id int(11) primary key auto_increment,
    account varchar(20) not null,
    password varchar(32),
    nickName varchar(20),
    registerDt timestamp,
    loginDt timestamp,
    unique accountIndex (account) -- account 唯一索引
) auto_increment=10000;

create table user_year_2019 (
    userId int(11) primary key,
    content json,
    createDt timestamp,
    updateDt timestamp
);