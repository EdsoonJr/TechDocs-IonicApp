export interface Review {
    id?: string; // ID único da avaliação
    pdfId: string; // ID do PDF avaliado
    userId: string; // ID do usuário que avaliou
    rating: number; // Nota dada (1 a 5)
  }
  