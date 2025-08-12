# 🌱 Database Seeding

Este diretório contém os seeds para popular o banco de dados com dados de teste.

## 📋 O que o Seed Faz

O `InitialDataSeed` cria **500 registros** para cada uma das seguintes entidades:

### 👥 Users (500)
- Emails únicos gerados com faker
- Senha padrão: `password123` (será hasheada automaticamente)

### 👨‍🌾 Farmers (500)
- Nomes completos brasileiros
- CPF ou CNPJ válidos (nunca ambos)
- CPFs e CNPJs são gerados com algoritmos válidos

### 🏡 Farms (500)
- Nomes de fazendas baseados em empresas + ruas
- 20 cidades brasileiras principais
- 20 estados brasileiros
- Áreas totais entre 10 e 1000 hectares
- Áreas de cultivo e vegetação calculadas proporcionalmente
- Distribuídas entre os farmers existentes

### 🌾 Harvests (500)
- Anos entre 2020 e 2024
- Distribuídas entre as farms existentes

### 🥬 Crops (500)
- 32 tipos diferentes de culturas brasileiras
- Distribuídas entre harvests e farms existentes

## 🚀 Como Executar

### 1. Certifique-se de que o banco está rodando
```bash
# Verifique se o PostgreSQL está ativo
docker ps  # se estiver usando Docker
# ou
sudo systemctl status postgresql  # se estiver instalado localmente
```

### 2. Execute o seed
```bash
npm run seed
```

### 3. Verifique os logs
O seed mostrará o progresso:
```
🌱 Starting data seeding...
🧹 Clearing existing data...
✅ Existing data cleared
✅ Created 500 users
✅ Created 500 farmers
✅ Created 500 farms
✅ Created 500 harvests
✅ Created 500 crops
🎉 All data seeded successfully!
```

## ⚠️ Importante

- **O seed limpa todos os dados existentes** antes de inserir os novos
- **500 registros por tabela** = 2500 registros no total
- **Relacionamentos preservados**: farms → farmers, harvests → farms, crops → harvests/farms
- **Dados realistas**: CPFs, CNPJs, cidades, estados e culturas brasileiras

## 🔧 Personalização

Para modificar o seed:

1. **Quantidade de dados**: Altere o loop `for (let i = 0; i < 500; i++)`
2. **Tipos de culturas**: Modifique o array `cropNames`
3. **Cidades e estados**: Edite os arrays `brazilianCities` e `brazilianStates`
4. **Validações**: Ajuste os ranges de áreas em `createFarms()`

## 🐛 Troubleshooting

### Erro de conexão
```
❌ Error during seeding: connect ECONNREFUSED
```
**Solução**: Verifique se o PostgreSQL está rodando e as variáveis de ambiente estão corretas.

### Erro de permissão
```
❌ Error during seeding: permission denied
```
**Solução**: Verifique se o usuário do banco tem permissões para criar/truncar tabelas.

### Erro de foreign key
```
❌ Error during seeding: foreign key constraint
```
**Solução**: O seed já lida com isso, mas verifique se as entidades estão sincronizadas.

## 📊 Resultado Esperado

Após o seed, você terá:
- **Users**: 500 usuários com emails únicos
- **Farmers**: 500 agricultores com CPF ou CNPJ
- **Farms**: 500 propriedades rurais distribuídas pelo Brasil
- **Harvests**: 500 safras de diferentes anos
- **Crops**: 500 culturas distribuídas entre safras e fazendas

Todos os dados estarão interconectados e prontos para testes e desenvolvimento!
