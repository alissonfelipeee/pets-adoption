
# Pet's Adoption API

Este projeto tem como finalidade o desenvolvimento de uma API de adoção de pets utilizando uma stack de tecnologias que eu tenho conhecimento e que eu gostaria de aprimorar.



## Stack utilizada

+ **Back-end:** Node.js, Express, Typescript, Prisma, Jest e Swagger.


## Aprendizados

+ Com a construção desse projeto, aprendi a utilizar JWT para realização de autenticações, aprendi a criar relacionamentos entre diferentes tabelas utilizando o Prisma, com o Swagger aprendi a requerer autenticação para rotas específicas.


## Conceitos utilizados

+ SOLID
+ Injeção de Dependência
+ Repository Pattern


## Documentação

A documentação pode ser acessada na rota **/docs** da aplicação.


## Rodando localmente

Clone o projeto

```bash
  git clone https://github.com/alissonfelipeee/pets-adoption
```

Entre no diretório do projeto

```bash
  cd my-project
```

Instale as dependências

```bash
  npm install
```

Renomeie o arquivo **.env.example** para **.env** e preencha as variáveis de ambiente caso julgue necessário


Gere o Prisma Client

```bash
  npx prisma generate
```

Faça uma migração para gerar as tabelas no banco de dados

```bash
  npx prisma migrate dev
```

Inicie o servidor

```bash
  npm run start
```


## Rodando os testes

Para rodar os testes, rode o seguinte comando

```bash
  npm run test
```

