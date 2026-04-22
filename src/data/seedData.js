export const seedUsers = [
  { id: "u-admin", name: "Ana Silva", email: "ana@smartstock.com", password: "admin123", role: "ADMIN", active: true, createdAt: "2025-03-01T12:00:00.000Z" },
  { id: "u-carlos", name: "Carlos Souza", email: "carlos@smartstock.com", password: "user123", role: "USER", active: true, createdAt: "2025-03-05T12:00:00.000Z" },
  { id: "u-maria", name: "Maria Oliveira", email: "maria@smartstock.com", password: "user123", role: "USER", active: true, createdAt: "2025-03-10T12:00:00.000Z" },
  { id: "u-joao", name: "João Pereira", email: "joao@smartstock.com", password: "user123", role: "USER", active: false, createdAt: "2025-03-12T12:00:00.000Z" },
];

export const seedCategories = [
  { id: "c-ele", name: "Eletrônicos", description: "Dispositivos e componentes eletrônicos", createdAt: "2025-01-10T12:00:00.000Z" },
  { id: "c-per", name: "Periféricos", description: "Teclados, mouses, webcams e afins", createdAt: "2025-01-12T12:00:00.000Z" },
  { id: "c-mov", name: "Móveis", description: "Mesas, cadeiras e mobília de escritório", createdAt: "2025-02-01T12:00:00.000Z" },
  { id: "c-arm", name: "Armazenamento", description: "HDs, SSDs e cartões de memória", createdAt: "2025-02-15T12:00:00.000Z" },
  { id: "c-aces", name: "Acessórios", description: "Cabos, adaptadores e acessórios diversos", createdAt: "2025-03-01T12:00:00.000Z" },
];

export const seedSuppliers = [
  { id: "s-silva", name: "Distribuidora Silva Ltda", cnpj: "12.345.678/0001-95", email: "contato@silva.com.br", phone: "(11) 3456-7890", createdAt: "2025-01-15T12:00:00.000Z" },
  { id: "s-oli", name: "Atacado Oliveira S.A.", cnpj: "98.765.432/0001-91", email: "vendas@oliveira.com.br", phone: "(21) 2345-6789", createdAt: "2025-01-20T12:00:00.000Z" },
  { id: "s-san", name: "Indústria Santos & Filhos", cnpj: "11.222.333/0001-81", email: "santos@industria.com.br", phone: "(31) 3456-1234", createdAt: "2025-02-05T12:00:00.000Z" },
  { id: "s-per", name: "Comércio Pereira ME", cnpj: "55.666.777/0001-08", email: "pereira@comercio.com.br", phone: "(41) 4567-8901", createdAt: "2025-02-20T12:00:00.000Z" },
];

export const seedProducts = [
  { id: "p-nb-dell", name: "Notebook Dell Inspiron 15", sku: "NB-DELL-001", price: 3499.9, cost: 2800, quantity: 25, minQuantity: 10, categoryId: "c-ele", supplierId: "s-silva", createdAt: "2025-02-01T12:00:00.000Z" },
  { id: "p-ms-log", name: "Mouse Logitech MX Master 3", sku: "MS-LOG-042", price: 499.9, cost: 350, quantity: 58, minQuantity: 20, categoryId: "c-per", supplierId: "s-oli", createdAt: "2025-02-02T12:00:00.000Z" },
  { id: "p-tc-red", name: "Teclado Mecânico Redragon", sku: "TC-RED-015", price: 289.9, cost: 180, quantity: 3, minQuantity: 10, categoryId: "c-per", supplierId: "s-oli", createdAt: "2025-02-03T12:00:00.000Z" },
  { id: "p-mn-lg", name: "Monitor LG UltraWide 29\"", sku: "MN-LG-029", price: 1899.9, cost: 1400, quantity: 12, minQuantity: 5, categoryId: "c-ele", supplierId: "s-silva", createdAt: "2025-02-04T12:00:00.000Z" },
  { id: "p-cd-tx3", name: "Cadeira Gamer ThunderX3", sku: "CD-TX3-007", price: 1299.9, cost: 850, quantity: 8, minQuantity: 5, categoryId: "c-mov", supplierId: "s-san", createdAt: "2025-02-05T12:00:00.000Z" },
  { id: "p-wc-log", name: "Webcam Logitech C920", sku: "WC-LOG-920", price: 399.9, cost: 280, quantity: 34, minQuantity: 15, categoryId: "c-per", supplierId: "s-oli", createdAt: "2025-02-06T12:00:00.000Z" },
  { id: "p-hd-kng", name: "SSD Kingston 480GB", sku: "HD-KNG-480", price: 259.9, cost: 170, quantity: 45, minQuantity: 20, categoryId: "c-arm", supplierId: "s-per", createdAt: "2025-02-07T12:00:00.000Z" },
  { id: "p-cb-hdm", name: "Cabo HDMI 2m", sku: "CB-HDM-005", price: 29.9, cost: 12, quantity: 2, minQuantity: 50, categoryId: "c-aces", supplierId: "s-per", createdAt: "2025-02-08T12:00:00.000Z" },
  { id: "p-hs-gam", name: "Headset Gamer HyperX Cloud", sku: "HS-GAM-008", price: 459.9, cost: 320, quantity: 34, minQuantity: 10, categoryId: "c-per", supplierId: "s-oli", createdAt: "2025-02-09T12:00:00.000Z" },
];

export const seedMovements = [
  { id: "m-001", date: "2026-04-15T10:30:00.000Z", productId: "p-nb-dell", type: "ENTRADA", quantity: 20, reason: "Compra fornecedor", userId: "u-admin" },
  { id: "m-002", date: "2026-04-16T14:22:00.000Z", productId: "p-ms-log", type: "SAIDA", quantity: -12, reason: "Venda cliente #204", userId: "u-carlos" },
  { id: "m-003", date: "2026-04-17T09:15:00.000Z", productId: "p-tc-red", type: "AJUSTE", quantity: -3, reason: "Inventário — divergência", userId: "u-admin" },
  { id: "m-004", date: "2026-04-18T11:00:00.000Z", productId: "p-mn-lg", type: "ENTRADA", quantity: 10, reason: "Reposição estoque", userId: "u-maria" },
  { id: "m-005", date: "2026-04-19T15:45:00.000Z", productId: "p-wc-log", type: "SAIDA", quantity: -8, reason: "Venda cliente #198", userId: "u-carlos" },
  { id: "m-006", date: "2026-04-20T10:10:00.000Z", productId: "p-hs-gam", type: "SAIDA", quantity: -5, reason: "Venda cliente #211", userId: "u-admin" },
  { id: "m-007", date: "2026-04-21T16:30:00.000Z", productId: "p-hd-kng", type: "ENTRADA", quantity: 30, reason: "Compra fornecedor", userId: "u-admin" },
];
