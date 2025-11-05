/**
 * Helper functions for member roles and partitions
 */

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    presidente: "Presidente",
    vice_presidente_1: "Vice-presidente 1",
    vice_presidente_2: "Vice-presidente 2",
    secretario_1: "Secretário 1",
    secretario_2: "Secretário 2",
    inspector: "Inspector",
    inspector_adj: "Inspector Adjunto",
    coordenador: "Coordenador",
    coordenador_adj: "Coordenador Adjunto",
    dirigente_tecnico: "Dirigente Técnico",
    chefe_particao: "Chefe de Partição",
    chefe_categoria: "Chefe de Categoria",
    protocolo: "Protocolo",
    relacao_publica: "Relação Pública",
    evangelista: "Evangelista",
    conselheiro: "Conselheiro",
    disciplinador: "Disciplinador",
    financeiro: "Financeiro",
    membro_simples: "Membro Simples",
    // Legacy values for backward compatibility
    membro: "Membro",
    vice_presidente: "Vice-presidente",
    secretario: "Secretário",
    tesoureiro: "Tesoureiro",
  };
  return labels[role] || role;
};

export const getPartitionLabel = (partition: string): string => {
  const labels: Record<string, string> = {
    soprano: "Soprano",
    alto: "Alto",
    tenor: "Tenor",
    base: "Base",
    baryton: "Baryton",
    trompete: "Trompete",
    trombones: "Trombones",
    tubas: "Tubas",
    clarinetes: "Clarinetes",
    saxofone: "Saxofone",
    caixa_1: "1ª Caixa",
    caixa_2: "2ª Caixa",
    caixa_3: "3ª Caixa",
    percussao: "Percussão",
    // Legacy values for backward compatibility
    contralto: "Contralto",
    baixo: "Baixo",
    instrumental: "Instrumental",
  };
  return labels[partition] || partition;
};

export const getRoleLevel = (role: string): number => {
  if (['presidente', 'vice_presidente_1', 'vice_presidente_2', 'secretario_1', 'secretario_2'].includes(role)) return 1;
  if (['inspector', 'inspector_adj', 'coordenador', 'coordenador_adj'].includes(role)) return 2;
  if (role === 'dirigente_tecnico') return 3;
  if (['chefe_particao', 'chefe_categoria'].includes(role)) return 4;
  if (['protocolo', 'relacao_publica', 'evangelista', 'conselheiro', 'disciplinador'].includes(role)) return 5;
  if (role === 'financeiro') return 6;
  return 7; // membro_simples
};

export const getPartitionCategory = (partition: string): string => {
  if (['soprano', 'alto', 'tenor', 'base', 'baryton', 'contralto', 'baixo'].includes(partition)) return 'Vozes';
  if (['trompete', 'trombones', 'tubas'].includes(partition)) return 'Metais';
  if (['clarinetes', 'saxofone'].includes(partition)) return 'Madeiras';
  if (['caixa_1', 'caixa_2', 'caixa_3', 'percussao'].includes(partition)) return 'Percussão';
  if (partition === 'instrumental') return 'Instrumental';
  return 'Outros';
};
