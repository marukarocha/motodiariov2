Moto Diário V2Versão atualizada da aplicação Web Moto Diário.
Manifesto do CachorroLokoO Moto Diário V2 é uma aplicação web desenvolvida com Next.js, utilizando TypeScript e Tailwind CSS com a lib ShadCN UI. Este projeto tem como objetivo facilitar o gerenciamento e a visualização de ganhos, horas trabalhadas, ganhos por app e abastecimentos. Além disso, integra dados de quilômetros rodados a informações da motocicleta, como manutenções (trocas de óleo, lubrificações, trocas de relação, quilômetros totais rodados, etc.). O sistema oferece funcionalidades como a listagem de registros, um dashboard interativo e outros recursos que auxiliam o motoentregador tanto no dia a dia quanto na manutenção da moto.
Funcionalidades PrincipaisGerenciamento Financeiro: Controle de ganhos diários, ganhos por aplicativo e metas diárias.
Registro e Monitoramento de Manutenção: Histórico de abastecimentos, trocas de óleo e outros serviços essenciais para a moto.
Dashboard Interativo: Visualização dinâmica dos dados coletados.
Integração com GPS: Monitoramento da distância percorrida e rastreamento dos trajetos.
Autenticação de Usuário: Gerenciamento de login e perfis de usuários.
Estrutura do ProjetoA estrutura do projeto está organizada da seguinte forma:
.
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/auth/
│   │   ├── bike/
│   │   ├── earnings/
│   │   ├── fuelings/
│   │   ├── login/
│   │   ├── styles/
│   │   ├── user/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── bike/
│   │   ├── earnings/
│   │   ├── fuelings/
│   │   ├── gps/
│   │   ├── home/
│   │   ├── maintenances/
│   │   ├── overview.tsx
│   │   ├── sidebar.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-switcher.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── ui/
│   │   ├── user/
│   │   └── weather/
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useDashboardData.tsx
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── db/
│   │   │   ├── firebaseContext.tsx
│   │   │   ├── firebaseServices.ts
│   │   │   └── firebase.js
│   │   ├── utils.ts
│   ├── public/
│   ├── styles/
│   ├── types/
│   │   ├── types.ts
│   ├── testes.css
└── ...Instalação e ConfiguraçãoPré-requisitosNode.js (versão recomendada: 14 ou superior)
NPM ou Yarn
Passos para InstalaçãoClone o repositório:
git clone https://github.com/marukarocha/motodiariov2.gitEntre na pasta do projeto:
cd motodiariov2Instale as dependências:
npm install
# ou
yarn installExecuçãoPara iniciar o servidor de desenvolvimento, execute:
npm run dev
# ou
yarn devAbra http://localhost:3000 no seu navegador para visualizar a aplicação.
Arquivos Importantes para AlteraçãoOs seguintes arquivos são críticos para implementação de novas funcionalidades e devem ser atualizados conforme o desenvolvimento:
src/lib/db/firebaseServices.ts
src/lib/db/firebaseContext.tsx
src/components/data-table.tsx
src/components/sidebar.tsx
src/hooks/useDashboardData.tsx
Tecnologias UtilizadasNext.js: Framework React para construção de aplicações web escaláveis.
TypeScript: Superset do JavaScript com tipagem estática.
Tailwind CSS: Framework CSS utilitário para desenvolvimento ágil.
ShadCN UI: Biblioteca de componentes UI modernos.
Firebase: Autenticação e banco de dados para persistência de dados.
ESLint: Ferramenta de linting para manter a qualidade do código.
Documentação e RoadmapDocumentação Completa:Para acompanhar as funcionalidades implementadas, em desenvolvimento e as futuras, consulte o arquivo ROADMAP.md (a ser criado/atualizado conforme o progresso do projeto).
Contribuição:Se você deseja contribuir com o projeto, verifique as diretrizes de contribuição e abra uma issue ou pull request. (Crie um arquivo CONTRIBUTING.md com as instruções necessárias.)
LicençaEste projeto está licenciado sob a MIT License.(Ajuste conforme a licença utilizada)
ContatoEm caso de dúvidas ou sugestões, entre em contato por:
Email: seu-email@dominio.com
GitHub: @marukarocha
