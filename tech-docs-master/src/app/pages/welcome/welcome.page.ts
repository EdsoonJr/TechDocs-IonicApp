import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
  images = [
    '../../../assets/images/welcome-img.svg',
    '../../../assets/images/download-img.svg',
    '../../../assets/images/upload.svg',
    '../../../assets/images/buscar.svg',
    '../../../assets/images/folder.svg',
    '../../../assets/images/stars.svg',
    '../../../assets/images/time.svg',
  ];

  title = ['Bem-Vindo(a) ao TechDocs!'];

  content = [
    'A sua mais nova plataforma colaborativa de conteúdos de TI!',
    'Aqui, você terá acesso a uma vasta biblioteca de PDFs para download',
    'Além disso, você pode contribuir com a comunidade compartilhando seus próprios PDFs. Incrível, não é?',
    'Conte com ferramentas de pesquisa personalizada para encontrar exatamente o que procura.',
    'E o mais legal: você pode criar pastas personalizadas para organizar seus PDFs da maneira que preferir!',
    'No TechDocs, o feedback é essencial para inspirar e motivar nossos membros. Deixe sua avaliação quando encontrar algo que goste!',
    'Não perca tempo! Corre e vem fazer parte dessa grande comunidade que é o TechDocs!',
  ];

  constructor() {}

  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }
  ngOnInit() {}
}
