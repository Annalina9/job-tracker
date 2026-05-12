import styles from './CoverLetterPreview.module.css';

interface CoverLetterPreviewProps {
  bodyText: string;
  company: string;
  role: string;
  template: 'evergreen' | 'purple' | 'blue' | 'amber';
  authorName: string;
  authorContact: string;
  printMode?: boolean;
}

export default function CoverLetterPreview({
  bodyText,
  company,
  role,
  template,
  authorName,
  authorContact,
  printMode = false,
}: CoverLetterPreviewProps) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fallback for legacy templates (minimal, professional, premium, modern)
  const safeTemplate = ['evergreen', 'purple', 'blue', 'amber'].includes(template) 
    ? template 
    : 'evergreen';

  return (
    <div className={`${styles.page} ${styles[safeTemplate]} ${printMode ? styles.printMode : ''}`}>
      <ThemeTemplate
        bodyText={bodyText}
        company={company}
        authorName={authorName}
        authorContact={authorContact}
        date={today}
        theme={safeTemplate}
      />
    </div>
  );
}

/* ── THEMED TEMPLATE ── */
interface ThemeTemplateProps {
  bodyText: string;
  company: string;
  authorName: string;
  authorContact: string;
  date: string;
  theme: string;
}

function ThemeTemplate({ bodyText, company, authorName, authorContact, date, theme }: ThemeTemplateProps) {
  return (
    <>
      <div className={styles.modernHeader}>
        <div className={styles.modernName}>{authorName}</div>
        <div className={styles.modernContact}>{authorContact}</div>
        <div className={styles.modernDivider} />
      </div>
      <div className={styles.body}>
        {formatBody(bodyText)}
      </div>
    </>
  );
}

function formatBody(text: string) {
  const paras = text.split(/\n\n+/);
  
  // Find the salutation ("Dear X") so we know where the body actually begins
  const salutationIdx = paras.findIndex(p => /^(Dear|To|Hi|Hello)\b/i.test(p.trim()));
  
  // The user requested the 3rd paragraph (after the salutation) to be the callout
  const targetCalloutIdx = salutationIdx !== -1 ? salutationIdx + 3 : -1;

  return paras.map((para, i) => {
    // It's a callout if it's the 3rd body paragraph, OR if it matches the "Insight(s):" pattern
    const matchesKeyword = /^((?:[A-Za-z\s]+)?Insights?:)(.*)/is.exec(para);
    // Check if this paragraph is likely the signature block (last 2 paragraphs, usually short)
    const isSignatureBlock = i >= paras.length - 2 && para.length < 100;
    
    // Auto-trigger on 3rd paragraph, ONLY if it doesn't look like the end of the letter
    const isAutoCallout = i === targetCalloutIdx && !isSignatureBlock;
    const isCallout = isAutoCallout || matchesKeyword !== null;
    
    if (isCallout) {
      // If there's a colon in the first sentence/phrase, bold it so it looks structured
      const colonSplit = para.match(/^([^:\n]+:)(.*)/is);
      
      if (colonSplit) {
        return (
          <div key={i} className={`${styles.para} ${styles.callout}`}>
            <strong>{colonSplit[1]}</strong>
            {colonSplit[2].split('\n').map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </div>
        );
      } else {
        // No colon found, just highlight the whole paragraph
        return (
          <div key={i} className={`${styles.para} ${styles.callout}`}>
            {para.split('\n').map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </div>
        );
      }
    }

    return (
      <p key={i} className={styles.para}>
        {para.split('\n').map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}
