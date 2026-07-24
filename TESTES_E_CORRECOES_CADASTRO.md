# Relatório de Testes no Navegador e Correções de Bugs (ListaFacil)

## 📌 Visão Geral
Este documento registra a execução de testes automatizados via navegador web no aplicativo **ListaFacil** (`http://localhost:8081`), a identificação das causas do fechamento inesperado (crash) do app no celular ao cadastrar itens e as soluções implementadas.

---

## 🔍 Causas Identificadas para o Crash no Celular (Mobile Android/iOS)

### 1. `TypeError` por falta de verificação defensiva em `formatQuantity`
- **Problema:** A função `formatQuantity` em `src/utils/formatters.ts` utilizava `Number.isInteger(quantity)` sem validar se `quantity` era `undefined`, `null` ou `NaN`.
- **Efeito no Celular:** Ao tentar formatar um valor nulo/indefinido (ou gerado por falha na conversão numérica), o JavaScript Core / Hermes no React Native lançava uma exceção não tratada (`TypeError: Cannot read properties of undefined (reading 'toLocaleString')`), fechando o aplicativo imediatamente em ambiente de produção.

### 2. Tratamento de Vírgula `,` em Teclados Numéricos do Brasil (pt-BR)
- **Problema:** Nos celulares brasileiros, o teclado numérico padronizado insere vírgulas (ex: `10,50` ou `,50`). A função `parseFloat` em JavaScript para de ler a string na primeira vírgula (ex: `parseFloat("10,50")` retornava `10`, perdendo os centavos) ou gerava `NaN` para `,50`.
- **Efeito no Celular:** `Math.max(NaN, 0.01)` resulta em `NaN`. Ao salvar o estado com `NaN` no Redux Toolkit (RTK) e persisti-lo no AsyncStorage, o componente de renderização falhava ao tentar formatar os números, resultando em crash.

### 3. Concatenação de Valores com Preenchimento Padrão (UX no Mobile)
- **Problema:** Ao focar em um campo que continha um valor padrão (como `"1"` na quantidade ou `"1000"` no peso do ingrediente), o usuário digitava por cima sem apagar primeiro, concatenando os números (ex: `1` + `2,5` virava `12,5`).

---

## 🛠️ Correções Implementadas

### 1. Formatação Defensiva (`src/utils/formatters.ts`)
- Adicionada validação estrita para `undefined`, `null` e `NaN` tanto em `formatQuantity` quanto em `formatCurrency`.
- Caso receba um valor inválido, retorna `"0 [unidade]"` ou `"R$ 0,00"` com fallback seguro sem quebrar o componente.

### 2. Conversão Numérica Robusta em Todos os Modais (`parseInputValue`)
- Criado helper `parseInputValue` em:
  - `src/components/AddEditItemModal.tsx`
  - `src/components/AddEditResourceModal.tsx`
  - `src/components/AddRecipeItemModal.tsx`
  - `src/screens/RecipeDetailScreen.tsx`
- A função substitui `,` por `.` antes da conversão e valida se o resultado é `NaN`. Caso seja `NaN`, aplica o valor padrão seguro (fallback), evitando que `NaN` entre no estado global do RTK.

### 3. Melhoria na UX dos Modais (`selectTextOnFocus`)
- Adicionada a propriedade `selectTextOnFocus` em todos os campos de entrada de texto dos modais (`TextInput`).
- No celular, quando o usuário toca em um campo (como quantidade ou preço), o valor padrão é automaticamente selecionado, permitindo sobrescrevê-lo diretamente com a nova digitação.

---

## 🧪 Resultados dos Testes no Navegador

Os testes foram executados via navegador web automatizado em `http://localhost:8081` simulando o fluxo de uso:

1. **Criação de Lista de Compras:**
   - Lista "Compras da Semana" criada com sucesso.
2. **Cadastro de Item com Décimas e Vírgula:**
   - Item: "Leite Condensado"
   - Quantidade: `2,5` un
   - Preço Unitário: `6,50`
   - **Resultado:** Calculou o total estimado de **R$ 16,25** e exibiu a quantidade formatada como **2,5 un** sem erros.
3. **Cadastro de Ingrediente Base (Ficha Técnica):**
   - Ingrediente: "Açúcar Refinado"
   - Peso de Compra: `1000` g
   - Valor Pago: `5,49`
   - **Resultado:** Salvo com sucesso e exibido na lista com os valores formatados.
4. **Verificação de Logs de Console:**
   - Nenhum erro ou exceção não tratada foi registrado após as alterações.
