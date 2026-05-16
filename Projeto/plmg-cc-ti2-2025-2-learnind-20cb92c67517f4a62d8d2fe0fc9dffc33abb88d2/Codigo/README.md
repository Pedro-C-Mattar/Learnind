# Código do Projeto

Este diretório contém o código-fonte da aplicação (backend Java) e os recursos estáticos entregues ao cliente.

Documentação completa e instruções gerais do projeto estão no README na raiz do repositório: [README.md](../../../../README.md)

Resumo rápido para desenvolvimento (pasta `learnind`):

```bash
cd Projeto/plmg-cc-ti2-2025-2-learnind-20cb92c67517f4a62d8d2fe0fc9dffc33abb88d2/Codigo/learnind
mvn clean package
mvn compile exec:java -Dexec.mainClass="app.Aplicacao"
```

Arquivos importantes:
- `src/main/java/app/Aplicacao.java` — ponto de entrada e definição das rotas HTTP
- `src/main/java/dao/DAO.java` — conexão com PostgreSQL (atenção: credenciais atualmente codificadas)
- `src/main/resources/public` — páginas HTML/CSS/JS servidas pela aplicação
- `src/main/resources/public/scriptBD/ScriptBD.sql` — script de criação do esquema do banco

Recomendação: leia o README raiz para visão completa, arquitetura e instruções de contribuição.

Configuração do banco (Azure PostgreSQL)

Para conectar-se ao banco na Azure, defina as variáveis de ambiente antes de executar a aplicação, por exemplo:

PowerShell:

```powershell
$env:LEARNIND_DB_HOST = 'learnindbd.postgres.database.azure.com'
$env:LEARNIND_DB_NAME = 'learnind'
$env:LEARNIND_DB_USER = 'adminld@learnindbd'
$env:LEARNIND_DB_PASS = 'sua_senha_aqui'
$env:LEARNIND_DB_SSL = 'true'
```

Bash:

```bash
export LEARNIND_DB_HOST='learnindbd.postgres.database.azure.com'
export LEARNIND_DB_NAME='learnind'
export LEARNIND_DB_USER='adminld@learnindbd'
export LEARNIND_DB_PASS='sua_senha_aqui'
export LEARNIND_DB_SSL='true'
```

O `DAO.java` foi alterado para ler essas variáveis e ativar `sslmode=require` quando `LEARNIND_DB_SSL=true`.