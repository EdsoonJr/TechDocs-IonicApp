import { Timestamp, serverTimestamp } from 'firebase/firestore'; // Importando os tipos corretamente

export interface Pdf {
  id?: string;                // O Firestore gerará automaticamente o ID do documento
  title: string;              // Título do PDF
  description: string;        // Descrição do conteúdo do PDF
  tags: string[];             // Tags associadas ao PDF como array de strings
  user_id: string;            // ID do usuário que fez o upload
  upload_date: Date;     // Data do upload como qualquer tipo (compatibilidade)
  url: string;                // URL gerada pelo Firebase Storage
  download_count: number;     // Número de downloads
  review_count: number;       // Número de avaliações
}
