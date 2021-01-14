## 项目介绍

本用例使用AWS的CDK创建一台EC2，EC2被赋予了使用session manager访问的权限，在环境生成之后，可以使用session manager进行运维操作。

### 执行代码

1. 安装好CDK环境，并且下载代码后，执行以下指令

```
npm run install @aws-cdk/aws-ec2, @aws-cdk/aws-iam
```

2. 编译代码

```
npm run build
```

3. 部署

```
cdk deploy
```

4. 删除环境

```
cdk destroy
```
