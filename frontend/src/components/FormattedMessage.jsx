import React from 'react';

export const FormattedMessage = ({ content }) => {
  const formatMathNotation = (text) => {
    // Format LaTeX-like math notation with proper styling
    return text
      // Variables like \(x\) or \(y\)
      .replace(/\\?\(([a-z0-9])\\?\)/gi, '<span class="font-serif italic text-purple-800">$1</span>')
      
      // Functions like \(f(x)\)
      .replace(/\\?\(([a-z0-9]+\([a-z0-9]+\))\\?\)/gi, '<span class="font-serif italic text-purple-800">$1</span>')
      
      // Expressions with ^ for superscript like \(x^2\)
      .replace(/\\?\(([a-z0-9])\^([0-9]+)\\?\)/gi, 
        '<span class="font-serif italic text-purple-800">$1<sup class="text-xs">$2</sup></span>')
      
      // More complex expressions like \(x^2 + y^2 = 25\)
      .replace(/\\?\(([^)]+)\\?\)/g, (match, p1) => {
        return '<span class="font-serif italic text-purple-800 bg-purple-50 px-1 rounded">' + 
          p1.replace(/\^([0-9]+)/g, '<sup class="text-xs">$1</sup>')
            .replace(/\+/g, '<span class="mx-1">+</span>')
            .replace(/-/g, '<span class="mx-1">-</span>')
            .replace(/=/g, '<span class="mx-1">=</span>')
            .replace(/\*/g, '<span class="mx-1">*</span>')
            .replace(/\//g, '<span class="mx-1">//</span>') +
        '</span>';
      });
  };

  const formatInlineText = (text) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    if (text.includes('<span class="font-serif') || text.includes('<sup class="text-xs">')) {
      return text;
    }

    let formattedText = text;
    
    // Apply math notation formatting
    formattedText = formatMathNotation(formattedText);
    
    // Apply other formatting with purple theme
    formattedText = formattedText
      // Bold + Italic: ***text***
      .replace(/\*\*\*(.*?)\*\*\*/g, '<span class="font-bold italic text-purple-800">$1</span>')
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-purple-700">$1</span>')
      // Italic: *text*
      .replace(/\*((?!\*)[^*]+)\*/g, '<span class="italic text-purple-600">$1</span>')
      // Inline code: `text`
      .replace(/`(.*?)`/g, '<code class="bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded font-mono text-sm text-purple-800">$1</code>')
      // Highlight key terms
      .replace(/(confidence|strategy|growth|progress|achievement|believe|overcome|challenge)/gi, 
               '<span class="bg-purple-100 text-purple-800 px-1 rounded-sm font-medium">$1</span>');
    
    return formattedText;
  };

  const formatContent = (text) => {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    // Split on actual newline characters
    const sections = text.split('\n').map(line => line.replace(/\r$/, ''));
    
    const formattedSections = [];
    let currentSection = null;
    let listLevel = 0;
    let inCodeBlock = false;
    let codeLanguage = '';
    let sectionCount = 0;

    const closeCurrentSection = (index) => {
      if (!currentSection) return;

      // Close out paragraph sections
      if (currentSection.type === 'paragraph') {
        formattedSections.push(
          <p
            key={`p-${index}`}
            className="text-gray-700 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatInlineText(currentSection.content.join(' '))
            }}
          />
        );
      }
      // Close out code blocks
      else if (currentSection.type === 'code') {
        formattedSections.push(
          <div key={`code-container-${index}`} className="relative">
            <div className="absolute top-0 right-0 bg-purple-700 text-white text-xs px-2 py-1 rounded-bl font-mono">
              {codeLanguage || 'code'}
            </div>
            <pre
              key={`code-${index}`}
              className="bg-gray-50 p-4 pt-8 rounded-lg my-4 font-mono text-sm overflow-x-auto border-l-4 border-purple-500 shadow-sm"
            >
              <code className={codeLanguage ? `language-${codeLanguage}` : ''}>
                {currentSection.content.join('\n')}
              </code>
            </pre>
          </div>
        );
      }
      currentSection = null;
    };

    sections.forEach((line, index) => {
      if (typeof line !== 'string') {
        line = String(line);
      }
      
      const trimmedLine = line.replace(/\s+$/, '');
      const indentMatch = line.match(/^(\s*)/);
      const indentSize = indentMatch ? indentMatch[1].length : 0;

      // CODE BLOCK HANDLING
      if (trimmedLine.match(/^```(\w*)$/)) {
        if (!inCodeBlock) {
          closeCurrentSection(index);
          inCodeBlock = true;
          const match = trimmedLine.match(/^```(\w*)$/);
          codeLanguage = match && match[1] ? match[1] : '';
          currentSection = { type: 'code', content: [] };
        } else {
          inCodeBlock = false;
          closeCurrentSection(index);
          codeLanguage = '';
        }
        return;
      }

      if (inCodeBlock && currentSection?.type === 'code') {
        currentSection.content.push(line);
        return;
      }

      // SECTION DIVIDERS
      if (trimmedLine.match(/^---+$/)) {
        closeCurrentSection(index);
        formattedSections.push(
          <div 
            key={`divider-${index}`} 
            className="border-b-2 border-purple-200 my-6 relative"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4 text-purple-600 text-sm font-semibold">
              Section Break
            </div>
          </div>
        );
        return;
      }

      // HEADINGS WITH SECTION NUMBERS
      if (trimmedLine.match(/^#\s+[^#]/)) {
        closeCurrentSection(index);
        sectionCount++;
        formattedSections.push(
          <h1
            key={`h1-${index}`}
            className="text-2xl font-bold text-purple-900 mt-6 mb-4 pb-2 border-b border-purple-200 flex items-center"
          >
            <span className="bg-purple-700 text-white w-7 h-7 flex items-center justify-center rounded-full mr-3 text-sm">
              {sectionCount}
            </span>
            <span dangerouslySetInnerHTML={{
              __html: formatInlineText(trimmedLine.replace(/^#\s+/, ''))
            }} />
          </h1>
        );
      }
      else if (trimmedLine.match(/^##\s+/)) {
        closeCurrentSection(index);
        formattedSections.push(
          <h2
            key={`h2-${index}`}
            className="text-xl font-bold text-purple-800 mt-5 mb-3 flex items-center"
          >
            <span className="w-1 h-6 bg-purple-500 mr-2"></span>
            <span dangerouslySetInnerHTML={{
              __html: formatInlineText(trimmedLine.replace(/^##\s+/, ''))
            }} />
          </h2>
        );
      }
      else if (trimmedLine.match(/^###\s+/)) {
        closeCurrentSection(index);
        formattedSections.push(
          <h3
            key={`h3-${index}`}
            className="text-lg font-semibold text-purple-700 mt-4 mb-2"
            dangerouslySetInnerHTML={{
              __html: formatInlineText(trimmedLine.replace(/^###\s+/, ''))
            }}
          />
        );
      }
      else if (trimmedLine.match(/^####\s+/)) {
        closeCurrentSection(index);
        formattedSections.push(
          <h4
            key={`h4-${index}`}
            className="text-base font-semibold text-purple-600 mt-3 mb-2"
            dangerouslySetInnerHTML={{
              __html: formatInlineText(trimmedLine.replace(/^####\s+/, ''))
            }}
          />
        );
      }

      // CORE IDEA HIGHLIGHTING
      else if (trimmedLine.match(/^Core Idea:/i)) {
        closeCurrentSection(index);
        
        const ideaContent = trimmedLine.replace(/^Core Idea:/i, '').trim();
        
        formattedSections.push(
          <div
            key={`core-idea-${index}`}
            className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded-r-lg my-4"
          >
            <div className="flex items-center">
              <div className="font-bold text-purple-800 mr-2">💡 Core Idea:</div>
              <div 
                className="text-purple-900" 
                dangerouslySetInnerHTML={{
                  __html: formatInlineText(ideaContent)
                }}
              />
            </div>
          </div>
        );
      }

      // UNORDERED LISTS
      else if (trimmedLine.match(/^\s*[*\-•]\s/)) {
        const nestLevel = Math.floor(indentSize / 2);

        if (!currentSection || currentSection.type !== 'unordered-list' || listLevel !== nestLevel) {
          closeCurrentSection(index);
          currentSection = {
            type: 'unordered-list',
            items: [],
            level: nestLevel
          };
          formattedSections.push(currentSection);
          listLevel = nestLevel;
        }

        const listItemContent = trimmedLine.replace(/^\s*[*\-•]\s/, '');
        currentSection.items.push(
          <li
            key={`ul-${index}`}
            className={`mb-2 text-gray-700 flex items-start ${
              nestLevel > 0 ? `ml-${nestLevel * 4}` : ''
            }`}
          >
            <span className="w-5 h-5 min-w-5 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 mr-3 mt-0.5">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatInlineText(listItemContent)
              }}
            />
          </li>
        );
      }

      // ORDERED LISTS
      else if (trimmedLine.match(/^\s*([0-9]+|[a-zA-Z])\.\s/)) {
        const isSectionHeader = trimmedLine.match(/^[0-9]+\.\s+[A-Z][a-z]+\s+[A-Z][a-z]+/);
        
        if (!isSectionHeader) {
          const nestLevel = Math.floor(indentSize / 2);

          if (!currentSection || currentSection.type !== 'ordered-list' || listLevel !== nestLevel) {
            closeCurrentSection(index);
            currentSection = {
              type: 'ordered-list',
              items: [],
              level: nestLevel
            };
            formattedSections.push(currentSection);
            listLevel = nestLevel;
          }

          const match = trimmedLine.match(/^\s*([0-9]+|[a-zA-Z])\.\s/);
          const bullet = match ? match[1] : '?';
          const listItemContent = trimmedLine.replace(/^\s*([0-9]+|[a-zA-Z])\.\s/, '');

          currentSection.items.push(
            <li
              key={`ol-${index}`}
              className={`mb-2 text-gray-700 flex items-start ${
                nestLevel > 0 ? `ml-${nestLevel * 4}` : ''
              }`}
            >
              <span className="w-6 h-6 min-w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-800 mr-3 text-sm font-medium">
                {bullet}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInlineText(listItemContent)
                }}
              />
            </li>
          );
        } else {
          if (!currentSection || currentSection.type !== 'paragraph') {
            closeCurrentSection(index);
            currentSection = { type: 'paragraph', content: [] };
          }
          currentSection.content.push(trimmedLine);
        }
      }

      // PARAGRAPHS
      else if (trimmedLine.trim()) {
        if (!currentSection || currentSection.type !== 'paragraph') {
          closeCurrentSection(index);
          currentSection = { type: 'paragraph', content: [] };
        }
        currentSection.content.push(trimmedLine);
      }

      // EMPTY LINES
      else if (trimmedLine === '') {
        closeCurrentSection(index);
        listLevel = 0;
      }
    });

    // Close any remaining open section
    closeCurrentSection(sections.length);

    // Build the final React elements from the sections
    return formattedSections.map((section, index) => {
      if (React.isValidElement(section)) {
        return section;
      }
      if (section?.type === 'unordered-list') {
        return (
          <ul
            key={`ul-${index}`}
            className="my-4 pl-2 list-none space-y-2 bg-gray-50 py-4 px-6 rounded-md border-l-2 border-purple-300"
          >
            {section.items}
          </ul>
        );
      }
      if (section?.type === 'ordered-list') {
        return (
          <ol
            key={`ol-${index}`}
            className="my-4 pl-2 list-none space-y-2 bg-gray-50 py-4 px-6 rounded-md border-l-2 border-purple-300"
          >
            {section.items}
          </ol>
        );
      }
      return null;
    });
  };

  return (
    <div className="formatted-message prose prose-purple max-w-none">
      {formatContent(content)}
    </div>
  );
};