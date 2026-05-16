# Learnind

Plataforma de videoaulas desenvolvida em Java (SparkJava) para disponibilização, organização e interação com conteúdos em vídeo.

## Sumário
- Visão geral
- Tecnologias
- Pré-requisitos
- Instalação e execução
- Banco de dados
- Estrutura do projeto
- Endpoints principais
- Testes
- Contribuição
- Licença

## Visão geral

O projeto implementa um backend em Java usando SparkJava que serve páginas estáticas em `/public` e fornece uma API REST mínima para gerenciamento de usuários, vídeos, categorias, favoritos e feedbacks.

## Tecnologias
- Java 24
- Maven
- SparkJava (framework web)
- PostgreSQL (banco de dados)
- Gson (JSON)
- BCrypt (hash de senhas)
- SLF4J (logging)

## Pré-requisitos
- JDK 24 instalado
- Maven 3.x
- Instância PostgreSQL (local ou serviço como Azure Database for PostgreSQL)

## Instalação e execução (rápido)

1. Abra um terminal e posicione-se na pasta do projeto:

```bash
cd Projeto/plmg-cc-ti2-2025-2-learnind-20cb92c67517f4a62d8d2fe0fc9dffc33abb88d2/Codigo/learnind
```

2. Compilar o projeto:

```bash
mvn clean package
```

3. Executar diretamente com o plugin `exec` do Maven (recomendado para desenvolvimento):

```bash
mvn compile exec:java -Dexec.mainClass="app.Aplicacao"
```

4. Alternativa: copiar dependências e executar pela classe principal (ex.: Windows):

```bash
mvn dependency:copy-dependencies package
java -cp "target/classes;target/dependency/*" app.Aplicacao
```
5. Abrir o localhost no navegador e testar

## Banco de dados

O script de criação das tabelas está em: [Projeto/plmg-cc-ti2-2025-2-learnind-20cb92c67517f4a62d8d2fe0fc9dffc33abb88d2/Codigo/learnind/src/main/resources/public/scriptBD/ScriptBD.sql](Projeto/plmg-cc-ti2-2025-2-learnind-20cb92c67517f4a62d8d2fe0fc9dffc33abb88d2/Codigo/learnind/src/main/resources/public/scriptBD/ScriptBD.sql)

Observação que o banco de dados está hospedado na nuvem (Microsoft Azure PostgreSQL)


## Estrutura do projeto

- `src/main/java/app` — classe `Aplicacao` (ponto de entrada, rotas HTTP)
- `src/main/java/dao` — classes de acesso a dados (conexões, queries)
- `src/main/java/model` — entidades/POJOs (Usuario, Video, Categoria, etc.)
- `src/main/java/service` — camada de serviços que encapsula regras de negócio
- `src/main/resources/public` — recursos estáticos (HTML/CSS/JS) servidos pela aplicação

## Endpoints principais (resumo)

- Autenticação/Usuário
    - `POST /usuario/register` — registrar usuário (form)
    - `POST /usuario/login` — efetuar login (form)
    - `GET /usuario/me` — dados do usuário logado (JSON)
    - `POST /usuario/me/update` — atualizar dados
    - `POST /usuario/logout` — logout
    - `POST /usuario/me/delete` — excluir conta

- Vídeos
    - `GET /videos` — listar (suporta `q` para busca e `categoria` para filtro)
    - `GET /video/get?id=...` — obter vídeo por id
    - `GET /videos/me` — vídeos do usuário logado

- Favoritos
    - `GET /favoritos/me` — vídeos favoritados do usuário

- Categorias
    - `POST /categoria/add` — adicionar categoria
    - `POST /categoria/update` — atualizar categoria

- Feedback
    - `POST /feedback/add` — adicionar feedback a um vídeo
    - `GET /feedbacks?videoId=...` — listar feedbacks de um vídeo

As páginas estáticas estão em `src/main/resources/public` e a aplicação redireciona `GET /` para `/landPage/index.html`.

## Autores

* Pedro Carvalho Mattar
* Bruno Alejandro Montero Commisso Coelho
* Laura Dias Bargas
* Yuri Penido Silva

## Licença

Veja o arquivo [LICENSE](LICENSE).
