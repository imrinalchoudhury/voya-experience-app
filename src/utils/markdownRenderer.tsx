import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps): JSX.Element {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle horizontal rules
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(
          <hr key={currentIndex++} className="my-4 border-t border-[#C9A96E] opacity-30" />
        );
        continue;
      }

      // Handle H2 headers
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={currentIndex++} className="text-[#C9A96E] text-[18px] font-semibold mt-4 mb-2" style={{ fontFamily: 'Cormorant Garamond' }}>
            {parseLine(line.substring(3))}
          </h2>
        );
        continue;
      }

      // Handle H3 headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={currentIndex++} className="text-[#C9A96E] text-[16px] font-semibold mt-3 mb-2" style={{ fontFamily: 'Cormorant Garamond' }}>
            {parseLine(line.substring(4))}
          </h3>
        );
        continue;
      }

      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const bulletItems: string[] = [];
        let j = i;

        while (j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('• '))) {
          const itemText = lines[j].trim().substring(2);
          bulletItems.push(itemText);
          j++;
        }

        elements.push(
          <ul key={currentIndex++} className="pl-3 my-2 space-y-1" style={{ lineHeight: '1.8' }}>
            {bulletItems.map((item, idx) => (
              <li key={idx} className="text-[#E5E5E5]">
                <span className="text-[#C9A96E] mr-2">•</span>
                {parseLine(item)}
              </li>
            ))}
          </ul>
        );

        i = j - 1;
        continue;
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const numberedItems: string[] = [];
        let j = i;

        while (j < lines.length && /^\d+\.\s/.test(lines[j].trim())) {
          const itemText = lines[j].trim().replace(/^\d+\.\s/, '');
          numberedItems.push(itemText);
          j++;
        }

        elements.push(
          <ol key={currentIndex++} className="pl-3 my-2 space-y-1" style={{ lineHeight: '1.8', listStyleType: 'decimal' }}>
            {numberedItems.map((item, idx) => (
              <li key={idx} className="text-[#E5E5E5] ml-4">
                {parseLine(item)}
              </li>
            ))}
          </ol>
        );

        i = j - 1;
        continue;
      }

      // Handle regular paragraphs
      if (line.trim()) {
        elements.push(
          <p key={currentIndex++} className="text-[#E5E5E5] my-2" style={{ lineHeight: '1.7' }}>
            {parseLine(line)}
          </p>
        );
      } else {
        elements.push(<br key={currentIndex++} />);
      }
    }

    return elements;
  };

  const parseLine = (line: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentText = '';
    let i = 0;
    let partIndex = 0;

    while (i < line.length) {
      // Handle bold text
      if (line.substring(i, i + 2) === '**') {
        if (currentText) {
          parts.push(<span key={partIndex++}>{currentText}</span>);
          currentText = '';
        }

        const endIndex = line.indexOf('**', i + 2);
        if (endIndex !== -1) {
          const boldText = line.substring(i + 2, endIndex);
          parts.push(
            <strong key={partIndex++} className="text-[#C9A96E] font-semibold">
              {boldText}
            </strong>
          );
          i = endIndex + 2;
          continue;
        }
      }

      // Handle links
      if (line[i] === '[') {
        const closeBracket = line.indexOf(']', i);
        const openParen = line.indexOf('(', closeBracket);
        const closeParen = line.indexOf(')', openParen);

        if (closeBracket !== -1 && openParen === closeBracket + 1 && closeParen !== -1) {
          if (currentText) {
            parts.push(<span key={partIndex++}>{currentText}</span>);
            currentText = '';
          }

          const linkText = line.substring(i + 1, closeBracket);
          const linkUrl = line.substring(openParen + 1, closeParen);

          parts.push(
            <a
              key={partIndex++}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C9A96E] underline decoration-dotted hover:text-[#D4B574] hover:decoration-solid transition-all"
            >
              {linkText}
            </a>
          );

          i = closeParen + 1;
          continue;
        }
      }

      currentText += line[i];
      i++;
    }

    if (currentText) {
      parts.push(<span key={partIndex++}>{currentText}</span>);
    }

    return parts;
  };

  return <div className="space-y-1">{parseMarkdown(content)}</div>;
}
