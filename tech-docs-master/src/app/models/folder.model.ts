export interface Folder {
    id?: string; // ID único da pasta
    title: string; // Título da pasta
    userId: string; // ID do usuário que criou a pasta
    pdfs: any; // IDs dos PDFs adicionados à pasta
    createdAt: Date; // Data de criação da pasta
  }
  