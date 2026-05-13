# Calculadora de Rescisão de Estágio

Ferramenta web para cálculo de rescisões de estágio, com suporte a bolsa mensal e pagamento por hora. Gera PDF formatado, mantém histórico local e funciona 100% no navegador, sem necessidade de instalação.

---

## Funcionalidades

- **Bolsa mensal** — calcula férias proporcionais, valor do último mês e valor por dia
- **Pagamento por hora** — calcula o valor hora por dia e o total de férias proporcional
- **Exportação em PDF** com design profissional (header, tabela, destaque do total)
- **Copiar resultado** para área de transferência
- **Histórico** dos últimos 10 cálculos (localStorage)
- **Modo claro / escuro**
- Interface em dashboard com animações nos cards

---

## Tipos de Cálculo

### Bolsa Mensal

**Entradas:** nome, data início, data fim, valor da bolsa, datas do último mês, dias de férias usufruídos

**Retornos:** dias estagiados, dias de direito a férias, dias restantes, valor por dia, valor total das férias, pagamento do último mês

### Pagamento por Hora

**Entradas:** nome, data início, data fim, valor da hora, horas diárias trabalhadas, dias de férias usufruídos

**Retornos:** dias estagiados, dias de direito a férias, dias restantes, valor hora por dia, valor total das férias

> Nesse modo o sistema calcula **apenas as férias**. O valor mensal não é calculado pois pode variar conforme faltas e descontos gerenciados externamente.

---

## Fórmulas

### Férias proporcionais
```
dias_estagiados / 365 * 30
```

### Valor das férias — Bolsa mensal
```
(valor_bolsa / 30) * dias_restantes_de_ferias
```

### Valor das férias — Pagamento por hora
```
valor_hora * horas_diarias = valor_por_dia
valor_por_dia * dias_de_direito_a_ferias
```

---

## Tecnologias

- HTML5 + CSS3 + JavaScript (Vanilla)
- jsPDF — geração de PDF com design

---

## Como Usar

1. Abra o `index.html` no navegador
2. Informe o nome do estagiário e o tipo de cálculo
3. Preencha os campos e clique em **Calcular valores**
4. Exporte o PDF ou copie o resultado

---

## Deploy

Disponível via GitHub Pages:

[https://ryan-wes.github.io/calculo-de-rescisao/](https://ryan-wes.github.io/calculo-de-rescisao/)

---

## Autor

Wesley Ryan Lopes  
🔗 [LinkedIn](https://www.linkedin.com/in/wryan-lopes)  
🌐 [Portfólio](https://ryan-wes.github.io/portfolio/)
