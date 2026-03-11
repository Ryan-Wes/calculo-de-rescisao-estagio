# Calculadora de Rescisão de Estágio

## Descrição

A **Calculadora de Rescisão de Estágio** é uma ferramenta web desenvolvida para auxiliar no cálculo de informações relacionadas ao encerramento de contratos de estágio.

O sistema permite calcular automaticamente:

- Total de dias estagiados
- Dias de férias proporcionais
- Dias de férias restantes (descontando férias usufruídas)
- Valor diário do estágio
- Valor total das férias
- Pagamento do último mês (quando aplicável)

A ferramenta foi criada para facilitar o trabalho de áreas administrativas e de recursos humanos que precisam realizar esses cálculos com frequência.

O sistema suporta dois tipos de cálculo:

- **Bolsa mensal**
- **Pagamento por hora**

---

## Funcionalidades

### 1. Cálculo por Bolsa Mensal

**Entradas:**

- Nome do estagiário
- Data de início do estágio
- Data final do estágio
- Valor da bolsa mensal
- Datas do último mês estagiado
- Dias de férias usufruídos

**Retornos:**

- Dias estagiados
- Dias de direito a férias
- Dias restantes de férias
- Valor da bolsa por dia
- Valor total das férias
- Pagamento do último mês

---

### 2. Cálculo por Pagamento por Hora

**Entradas:**

- Nome do estagiário
- Valor da hora
- Horas trabalhadas por dia
- Data de início do estágio
- Data final do estágio
- Dias de férias usufruídos

**Retornos:**

- Dias estagiados
- Dias de direito a férias
- Dias restantes de férias
- Valor por dia trabalhado
- Valor total das férias

Nesse modo o sistema calcula **apenas as férias**, pois o valor mensal pode variar devido a faltas ou descontos.

---

## Fórmulas Utilizadas

### Dias de férias proporcionais

```
dias_estagiados / 365 * 30
```

### Valor das férias

#### Bolsa mensal

```
valor_bolsa / 30 * dias_de_ferias_restantes
```

#### Pagamento por hora

```
valor_hora * horas_por_dia = valor_por_dia

valor_por_dia * dias_de_ferias_restantes
```

---

## Funcionalidades Extras

Além dos cálculos principais, o sistema também inclui:

- Histórico dos últimos cálculos
- Exportação dos resultados em **PDF**
- Botão para **copiar o resultado**
- **Modo claro / modo escuro**
- Interface em estilo **dashboard**
- Animações nos cards de resultado
- Máscara automática para valores em reais
- Armazenamento local do histórico (LocalStorage)

---

## Tecnologias Utilizadas

- **HTML5** — Estrutura da aplicação
- **CSS3** — Estilização e layout responsivo
- **JavaScript (Vanilla)** — Lógica de cálculo e interatividade
- **jsPDF** — Geração de arquivos PDF

---

## Como Usar

1. Insira o **nome do estagiário**.
2. Escolha o **tipo de cálculo**:
   - Bolsa mensal
   - Pagamento por hora
3. Preencha os campos necessários.
4. Informe os **dias de férias usufruídos**.
5. Clique em **Calcular valores**.

O sistema exibirá automaticamente:

- Dias estagiados
- Dias de férias
- Valor por dia
- Valor total das férias

Você também pode:

- Copiar o resultado
- Exportar o cálculo em PDF

---

## Instalação

Nenhuma instalação é necessária.

Basta clonar o repositório e abrir o arquivo `index.html` em qualquer navegador.

### Clonando o repositório

```bash
git clone https://github.com/Ryan-Wes/calculo-de-rescisao.git
```

Depois abra:

```
index.html
```

---

## Deploy

O projeto está disponível online via GitHub Pages:

[https://ryan-wes.github.io/calculo-de-rescisao/](https://ryan-wes.github.io/calculo-de-rescisao/)

---

## Contribuição

Contribuições são bem-vindas.

Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch

```bash
git checkout -b minha-feature
```

3. Faça commit das alterações

```bash
git commit -m "Minha nova feature"
```

4. Faça push da branch

```bash
git push origin minha-feature
```

---

## Autor

**Wesley Ryan Lopes**

- [LinkedIn](https://www.linkedin.com/in/wryan-lopes)
- [Portfólio](https://ryan-wes.github.io/portfolio/)
