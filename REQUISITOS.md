[VOLTAR](./README.md)

Desafio Full Stack Development
Resolve Aí — Plataforma de Gestão de Ocorrências

1. Contexto
   Condomínios, empresas, bairros e organizações enfrentam dificuldades para registrar,
   acompanhar e resolver problemas do dia a dia.
   Normalmente, as solicitações chegam por mensagens, e-mails ou conversas informais,
   dificultando a priorização e o acompanhamento.
   O desafio dos grupos será desenvolver uma plataforma digital chamada Resolve Aí, permitindo
   que usuários registrem ocorrências e acompanhem todo o processo até sua resolução.
   Exemplos de ocorrências:
   ● Problemas de iluminação;
   ● Equipamentos quebrados;
   ● Falta de acessibilidade;
   ● Problemas de limpeza;
   ● Vazamentos;
   ● Problemas de segurança;
   ● Solicitações de manutenção;
   ● Outras situações definidas pelo grupo.

Objetivo
Desenvolver uma aplicação Full Stack completa (MVP), desde a descoberta do domínio até a
publicação em ambiente Cloud.
A solução deverá contemplar:
● Arquitetura de software;
● Backend;
● APIs;
● Banco de dados;
● Frontend;
● Testes;
● Docker;
● Deploy em Cloud;
● Documentação;

Fluxograma
Perfis e responsabilidades

```mermaid
flowchart LR

    %% =========================
    %% SOLICITANTE
    %% =========================
    subgraph SOL["👤 Solicitante"]
        direction TB

        S1["Criar conta"]
        S2["Autenticar-se"]
        S3["Registrar ocorrência"]
        S4["Informar título, descrição<br/>e categoria"]
        S5["Informar localização"]
        S6["Anexar imagem"]
        S7["Acompanhar andamento"]
        S8["Adicionar comentários"]
        S9["Consultar histórico"]
        S10["Avaliar resolução"]

        S1 --> S2
        S2 --> S3
        S3 --> S4
        S4 --> S5
        S5 --> S6
        S6 --> S7
        S7 --> S8
        S8 --> S9
        S9 --> S10
    end

    %% =========================
    %% OCORRÊNCIA
    %% =========================
    O["📋 OCORRÊNCIA<br/><br/>
    Título<br/>
    Descrição<br/>
    Categoria<br/>
    Localização<br/>
    Imagem<br/>
    Prioridade<br/>
    Status<br/>
    Comentários<br/>
    Histórico"]

    %% =========================
    %% GESTOR
    %% =========================
    subgraph GES["👔 Gestor"]
        direction TB

        G1["Visualizar ocorrências"]
        G2["Filtrar por categoria,<br/>status e prioridade"]
        G3["Alterar prioridade"]
        G4["Atribuir responsável"]
        G5["Atualizar status"]
        G6["Adicionar comentários"]
        G7["Registrar solução aplicada"]
        G8["Visualizar dashboard"]

        G1 --> G2
        G2 --> G3
        G3 --> G4
        G4 --> G5
        G5 --> G6
        G6 --> G7
        G7 --> G8
    end

    S3 -->|"cria"| O
    S7 -.->|"acompanha"| O

    G1 -->|"consulta"| O
    G3 -->|"administra"| O
    G5 -->|"atualiza"| O
    G7 -->|"resolve"| O

    %% =========================
    %% ESTILOS
    %% =========================
    classDef solicitante fill:#EFF6FF,stroke:#2563EB,stroke-width:2px,color:#172554;
    classDef gestor fill:#F0F9FF,stroke:#0369A1,stroke-width:2px,color:#0C4A6E;
    classDef ocorrencia fill:#F0FDF4,stroke:#16A34A,stroke-width:3px,color:#14532D;

    class S1,S2,S3,S4,S5,S6,S7,S8,S9,S10 solicitante;
    class G1,G2,G3,G4,G5,G6,G7,G8 gestor;
    class O ocorrencia;
```

Ciclo de vida da ocorrência

```mermaid
flowchart LR

    A["📂 Aberta"]
    B["🔍 Em análise"]
    C["🔧 Em atendimento"]
    D["✅ Resolvida"]
    E["❌ Cancelada"]

    A -->|"Analisar"| B
    B -->|"Iniciar atendimento"| C
    C -->|"Concluir"| D

    A -.->|"Cancelar"| E
    B -.->|"Cancelar"| E
    C -.->|"Cancelar"| E

    %% Histórico
    H["🕘 Histórico da alteração<br/><br/>
    Status anterior<br/>
    Novo status<br/>
    Data e horário<br/>
    Usuário responsável<br/>
    Observação da alteração"]

    A -.-> H
    B -.-> H
    C -.-> H
    D -.-> H
    E -.-> H

    %% Estilos
    classDef normal fill:#EFF6FF,stroke:#2563EB,stroke-width:2px,color:#172554;
    classDef success fill:#F0FDF4,stroke:#16A34A,stroke-width:3px,color:#14532D;
    classDef cancel fill:#FEF2F2,stroke:#DC2626,stroke-width:3px,color:#991B1B;
    classDef history fill:#F8FAFC,stroke:#64748B,stroke-width:2px,color:#334155;

    class A,B,C normal;
    class D success;
    class E cancel;
    class H history;
```

Fluxo geral

```mermaid
flowchart LR

    A["📂 Aberta"]
    B["🔍 Em análise"]
    C["🔧 Em atendimento"]
    D["✅ Resolvida"]
    E["❌ Cancelada"]

    A -->|"Alterar status<br/>🕘 registra histórico"| B
    B -->|"Alterar status<br/>🕘 registra histórico"| C
    C -->|"Alterar status<br/>🕘 registra histórico"| D

    A -.->|"Cancelar<br/>🕘 registra histórico"| E
    B -.->|"Cancelar<br/>🕘 registra histórico"| E
    C -.->|"Cancelar<br/>🕘 registra histórico"| E

    H["🕘 Em toda mudança registrar:<br/><br/>
    • Status anterior<br/>
    • Novo status<br/>
    • Data e horário<br/>
    • Usuário responsável<br/>
    • Observação"]

    H --- B

    classDef normal fill:#EFF6FF,stroke:#2563EB,stroke-width:2px,color:#172554;
    classDef success fill:#F0FDF4,stroke:#16A34A,stroke-width:3px,color:#14532D;
    classDef cancel fill:#FEF2F2,stroke:#DC2626,stroke-width:3px,color:#991B1B;
    classDef info fill:#F8FAFC,stroke:#64748B,stroke-width:2px,color:#334155;

    class A,B,C normal;
    class D success;
    class E cancel;
    class H info;
```

Perfis de usuário
imagem perfis-de-usuario.png

Solicitante
Responsável por registrar e acompanhar uma ocorrência.
Deverá ser capaz de:
● Criar uma conta;
● Autenticar-se;
● Registrar uma ocorrência;
● Informar título, descrição e categoria;
● Informar localização;
● Anexar uma imagem;
● Acompanhar o andamento;
● Adicionar comentários;
● Consultar o histórico;
● Avaliar a resolução.
Gestor
Responsável por analisar e administrar as ocorrências.
Deverá ser capaz de:
● Visualizar todas as ocorrências;
● Filtrar por categoria, status e prioridade;
● Alterar prioridade;
● Atribuir um responsável;
● Atualizar o status;
● Adicionar comentários;
● Registrar a solução aplicada;
● Visualizar indicadores em um dashboard.
Fluxo principal
Cada ocorrência deverá possuir, no mínimo, os seguintes estados:

1. Aberta;
2. Em análise;
3. Em atendimento;
4. Resolvida;
5. Cancelada.
   Toda mudança de status deverá ser armazenada em um histórico contendo:
   ● Status anterior;
   ● Novo status;
   ● Data e horário;
   ● Usuário responsável;
   ● Observação da alteração.
