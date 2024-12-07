import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Review } from '../models/reviews.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private collectionName = 'reviews';

  constructor(private firestore: AngularFirestore) { }
  // Adicionar ou atualizar uma avaliação
  // Adicionar ou atualizar uma avaliação e recalcular a média
  async addOrUpdateReview(review: Review): Promise<void> {
    const docRef = this.firestore
      .collection(this.collectionName)
      .doc(`${review.pdfId}_${review.userId}`);
  
    // Adicionar ou atualizar a avaliação
    await docRef.set(review, { merge: true });
  
    // Recalcular a média das avaliações
    const reviewsSnapshot = await this.firestore
      .collection<Review>(this.collectionName, (ref) => ref.where('pdfId', '==', review.pdfId))
      .get()
      .toPromise();
  
    if (!reviewsSnapshot || reviewsSnapshot.empty) {
      console.warn(`Nenhuma avaliação encontrada para o PDF com ID: ${review.pdfId}`);
      return;
    }
  
    const reviews = reviewsSnapshot.docs.map((doc) => doc.data() as Review);
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  
    // Atualizar a média no documento do PDF
    const pdfRef = this.firestore.collection('pdfs').doc(review.pdfId);
    await pdfRef.update({ rating: averageRating });
  }
  // Buscar avaliações por PDF
  getReviewsByPdfId(pdfId: string): Observable<Review[]> {
    return this.firestore
      .collection<Review>(this.collectionName, (ref) =>
        ref.where('pdfId', '==', pdfId)
      )
      .valueChanges();
  }
  // Buscar avaliação de um usuário específico em um PDF
async getUserReviewForPdf(pdfId: string, userId: string): Promise<Review | null> {
  const docRef = await this.firestore
    .collection<Review>(this.collectionName)
    .doc(`${pdfId}_${userId}`)
    .get()
    .toPromise();

  // Verificação se `docRef` não é undefined e se o documento existe
  if (docRef && docRef.exists) {
    return docRef.data() as Review;
  }

  return null; // Retornar null se o documento não existir
}

}
