import { supabase } from "@/integrations/supabase/client";

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = ['-', '@'];

/**
 * Gera código aleatório com as seguintes regras:
 * - 5 a 7 caracteres de comprimento
 * - Combinação de letras maiúsculas (A-Z) e números (0-9)
 * - Exatamente UM símbolo: "-" (travessão) ou "@" (arroba)
 * - Posição aleatória de todos os caracteres
 */
export function generateCode(): string {
  // Determinar comprimento aleatório entre 5 e 7
  const length = Math.floor(Math.random() * 3) + 5; // 5, 6 ou 7
  
  // Escolher símbolo aleatoriamente
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  
  // Gerar caracteres alfanuméricos (length - 1 para deixar espaço para o símbolo)
  const alphanumericChars = LETTERS + NUMBERS;
  const chars: string[] = [];
  
  for (let i = 0; i < length - 1; i++) {
    chars.push(alphanumericChars[Math.floor(Math.random() * alphanumericChars.length)]);
  }
  
  // Adicionar o símbolo
  chars.push(symbol);
  
  // Embaralhar todas as posições (Fisher-Yates shuffle)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  
  return chars.join('');
}

/**
 * Verifica se o código de membro já existe
 */
export async function isMemberCodeUnique(code: string, excludeMemberId?: string): Promise<boolean> {
  const normalizedCode = code.toUpperCase().trim();
  
  let query = supabase
    .from('members')
    .select('id')
    .eq('member_code', normalizedCode);
  
  // Excluir o membro atual ao editar
  if (excludeMemberId) {
    query = query.neq('id', excludeMemberId);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Erro ao verificar código de membro:', error);
    return false;
  }
  
  return data === null; // É único se não encontrou nenhum registro
}

/**
 * Verifica se o código de grupo já existe
 */
export async function isGroupCodeUnique(code: string, excludeGroupId?: string): Promise<boolean> {
  const normalizedCode = code.toUpperCase().trim();
  
  let query = supabase
    .from('groups')
    .select('id')
    .eq('access_code', normalizedCode);
  
  // Excluir o grupo atual ao editar
  if (excludeGroupId) {
    query = query.neq('id', excludeGroupId);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Erro ao verificar código de grupo:', error);
    return false;
  }
  
  return data === null; // É único se não encontrou nenhum registro
}

/**
 * Gera código único para membro (com tentativas)
 */
export async function generateUniqueMemberCode(excludeMemberId?: string): Promise<string> {
  const maxAttempts = 10;
  
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateCode();
    const isUnique = await isMemberCodeUnique(code, excludeMemberId);
    
    if (isUnique) {
      return code;
    }
  }
  
  throw new Error('Não foi possível gerar um código único após várias tentativas');
}

/**
 * Gera código único para grupo (com tentativas)
 */
export async function generateUniqueGroupCode(excludeGroupId?: string): Promise<string> {
  const maxAttempts = 10;
  
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateCode();
    const isUnique = await isGroupCodeUnique(code, excludeGroupId);
    
    if (isUnique) {
      return code;
    }
  }
  
  throw new Error('Não foi possível gerar um código único após várias tentativas');
}
