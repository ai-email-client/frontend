import DOMPurify from 'dompurify'
import { Header } from './interface/email'

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if ('target' in node) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
    }
})

export function sanitizeHtml(content: string | null | undefined): string {
    if (!content) return ''

    return DOMPurify.sanitize(content, {
        ADD_ATTR: ['target', 'id', 'class', 'style'],
        ADD_TAGS: ['style', 'center'],
        WHOLE_DOCUMENT: true,
        FORCE_BODY: true,
    })
}

export function formatSize(bytes: number) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const senderFormat = (sender: string) => {
    if (!sender) return null;
    const match = sender.match(/^(.*?)(?:\s*<([^>]+)>)?$/);
    if (!match) return null;

    const extractedName = match[1].trim();
    const extractedEmail = match[2] ? match[2].trim() : extractedName;

    return { 
        name: extractedName || extractedEmail, 
        email: extractedEmail 
    };
};

export const getLabel= (label: string[]) => {
    const filteredData = label.filter(item => item.startsWith("Label_"));
    return filteredData
}

export const formatTimeAgo = (dateString: string) => {
  if (!dateString) return '';

  const emailDate = new Date(dateString);
  const now = new Date();
  
  const secondsPast = Math.floor((now.getTime() - emailDate.getTime()) / 1000);

  if (secondsPast < 0) return 'Just now';

  if (secondsPast < 60) {
    return 'Just now';
  }
  
  const minutes = Math.floor(secondsPast / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  return emailDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';

  const emailDate = new Date(dateString);

  return emailDate.toLocaleString('en-GB', {
    weekday: 'short',   
    day: 'numeric',    
    month: 'short',     
    year: 'numeric',   
    hour: '2-digit',   
    minute: '2-digit', 
    hour12: true       
  });
};

export const getFirstCharacter = (str: string) => {
  if (!str) return '';

  const match = str.match(/[\p{L}\p{N}]/u);

  return match ? match[0].toUpperCase() : str.charAt(0).toUpperCase();
}

export const getHeaderValue = (headers: Header[], headerName: string) => {
  return headers.find(header => header.name === headerName)?.value||''
}

export const parseInternalDate = () => {

}