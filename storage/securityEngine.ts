// storage/securityEngine.ts
import { Credential } from './credentials';

export interface VaultStats {
  high: { count: number; percent: number };
  medium: { count: number; percent: number };
  low: { count: number; percent: number };
  totalScore: number;
}

export const calculateVaultHealth = (accounts: Credential[]): VaultStats => {
  let high = 0, medium = 0, low = 0;

  // Filtramos solo cuentas que NO sean de mascota o movilidad (ya que esas no tienen pass real)
  const credentialsWithPass = accounts.filter(acc => acc.category !== 'pet' && acc.category !== 'mobility');

  credentialsWithPass.forEach(acc => {
    const pass = acc.password || "";
    
    // Tus reglas de negocio:
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const isLongEnough = pass.length >= 8;
    const isMediumLength = pass.length >= 6;
    
    // Regla: No números consecutivos (ej: 123)
    const hasConsecutiveNumbers = /(012|123|234|345|456|567|678|789|890)/.test(pass);

    // Evaluación
    const isHigh = isLongEnough && hasUpper && hasLower && hasNumber && hasSymbol && !hasConsecutiveNumbers;
    
    // Contamos cuántas reglas cumple para el nivel medio (al menos 3 de las de arriba)
    const rulesMet = [hasUpper, hasLower, hasNumber, hasSymbol, isLongEnough].filter(Boolean).length;

    if (isHigh) {
      high++;
    } else if (isMediumLength && rulesMet >= 3) {
      medium++;
    } else {
      low++;
    }
  });

  const total = credentialsWithPass.length || 1;
  return {
    high: { count: high, percent: (high / total) * 100 },
    medium: { count: medium, percent: (medium / total) * 100 },
    low: { count: low, percent: (low / total) * 100 },
    totalScore: Math.round((high / total) * 100)
  };
};