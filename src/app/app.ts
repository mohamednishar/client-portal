import { Component, ChangeDetectionStrategy, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit, OnDestroy {
  private translate = inject(TranslateService);

  private langChangeSub = this.translate.onLangChange.subscribe(() => {
    this.updateDocumentTitle();
  });

  ngOnInit(): void {
    this.updateDocumentTitle();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  private updateDocumentTitle(): void {
    this.translate.get('APP.TITLE').subscribe((title: string) => {
      if (title && title !== 'APP.TITLE') {
        document.title = title;
      }
    });
  }
}
