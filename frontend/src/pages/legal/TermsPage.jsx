import termsContent from './terms-of-service.md?raw';
import ReactMarkdown from 'react-markdown';

export default function TermsPage() {
  const handleDownload = () => {
    const blob = new Blob([termsContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'terms-of-service.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-10 py-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <button
          onClick={handleDownload}
          className="text-xs font-semibold uppercase tracking-widest border border-border-subtle rounded-lg px-4 py-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          Download
        </button>
      </div>

      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
        <ReactMarkdown>{termsContent}</ReactMarkdown>
      </div>
    </div>
  );
}