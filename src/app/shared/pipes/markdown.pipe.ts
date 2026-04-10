import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

    const html = value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replaceAll(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replaceAll(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replaceAll(/(\*\*|__)(.*?)(\*\*|__)/g, '<strong>$2</strong>')
      .replaceAll(/([*_])(.*?)([*_])/g, '<em>$2</em>')
      .replaceAll(/~~(.*?)~~/g, '<del>$1</del>')
      .replaceAll(/`(.*?)`/g, '<code>$1</code>')
      .replaceAll(/\[(.*?)]\((.*?)\)/g, (_, text, url) => {
        if (!/^https?:\/\//i.test(url)) return text;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      })
      .replaceAll(urlPattern, (_, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      })
      .replaceAll('\n', '<br>');

    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }
}
