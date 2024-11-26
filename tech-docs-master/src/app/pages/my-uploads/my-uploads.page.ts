import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-my-uploads",
  templateUrl: "./my-uploads.page.html",
  styleUrls: ["./my-uploads.page.scss"],
})
export class MyUploadsPage implements OnInit {
  myUploadedPDFs = [
    {
      id: 1,
      title: "PDF 1",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf1-thumbnail.png",
    },
    {
      id: 2,
      title: "PDF 2",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf2-thumbnail.png",
    },
    {
      id: 3,
      title: "PDF 3",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf3-thumbnail.png",
    },
    {
      id: 4,
      title: "PDF 4",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf3-thumbnail.png",
    },
  ];
  constructor() {}

  ngOnInit() {}
}
