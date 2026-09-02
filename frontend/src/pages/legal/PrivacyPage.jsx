import privacyContent from './privacy-policy.md?raw';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPage() {
  const handleDownload = () => {
    const blob = new Blob([privacyContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'privacy-policy.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-20 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-border-subtle pb-6 gap-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Privacy Policy</h1>
        <button
          onClick={handleDownload}
          className="text-[10px] font-bold uppercase tracking-widest border border-border-subtle rounded-lg px-4 py-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors shrink-0"
        >
          Download
        </button>
      </div>

      <div className="prose dark:prose-invert max-w-none text-left
        prose-p:text-[11px] prose-p:font-semibold prose-p:leading-loose prose-p:mb-6 
        prose-headings:font-extrabold prose-headings:mt-10 prose-headings:mb-4
        prose-h1:text-3xl prose-h2:text-xl prose-h3:text-sm
        prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-6
        prose-li:text-[11px] prose-li:font-semibold prose-li:my-1 prose-li:leading-loose
        prose-blockquote:text-[11px] prose-blockquote:font-semibold prose-blockquote:border-l-4 prose-blockquote:pl-4
        prose-strong:text-[11px] prose-strong:font-extrabold
        text-neutral-800 dark:text-neutral-200">
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
      </div>
    </div>
  );
}