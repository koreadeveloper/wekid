import { useEffect, useRef, useState } from 'react';
import { fetchAdminResults, getCareerName, toAdminDate } from '../../lib/adminResults';
import type { StoredTestResultRecord } from '../../types/firestore';

export type BusinessCardPrefill = {
  sourceId: string;
  name: string;
  email: string;
  job: string;
  school: string;
  goal: string;
};

type AdminBusinessCardBridgeProps = {
  enabled: boolean;
  onCreateBusinessCard: (prefill: BusinessCardPrefill) => void;
};

function formatDate(value: StoredTestResultRecord['createdAt']) {
  const date = toAdminDate(value);
  return date ? date.toLocaleString('ko-KR') : '-';
}

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function matchesRow(result: StoredTestResultRecord, cells: HTMLTableCellElement[]) {
  if (cells.length < 7) {
    return false;
  }

  const rowDate = normalize(cells[0].textContent ?? '');
  const rowName = normalize(cells[1].textContent ?? '').replace('테스트 의심', '').trim();
  const rowCenter = normalize(cells[2].textContent ?? '');
  const rowCareer = normalize(cells[3].textContent ?? '');

  return (
    rowDate === normalize(formatDate(result.createdAt)) &&
    rowName === normalize(result.participantName ?? '이름 없음') &&
    rowCenter === normalize(result.centerName ?? '센터 없음') &&
    rowCareer === normalize(getCareerName(result.topCareer))
  );
}

export function AdminBusinessCardBridge({ enabled, onCreateBusinessCard }: AdminBusinessCardBridgeProps) {
  const [results, setResults] = useState<StoredTestResultRecord[]>([]);
  const callbackRef = useRef(onCreateBusinessCard);

  useEffect(() => {
    callbackRef.current = onCreateBusinessCard;
  }, [onCreateBusinessCard]);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      return;
    }

    let cancelled = false;
    void fetchAdminResults().then((response) => {
      if (!cancelled && response.ok) {
        setResults(response.results);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || results.length === 0) {
      return;
    }

    const attachButtons = () => {
      const rows = document.querySelectorAll<HTMLTableRowElement>('.admin-table-card tbody tr');

      rows.forEach((row) => {
        if (row.querySelector('[data-business-card-button="true"]')) {
          return;
        }

        const cells = Array.from(row.cells);
        const result = results.find((candidate) => matchesRow(candidate, cells));
        const actionCell = cells[cells.length - 1];

        if (!result || !actionCell) {
          return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'admin-detail-button';
        button.dataset.businessCardButton = 'true';
        button.textContent = '명함 만들기';
        button.disabled = !result.participantName?.trim();
        button.title = button.disabled ? '이름이 없는 결과는 명함을 만들 수 없어요.' : '이 결과로 명함 만들기';
        button.addEventListener('click', () => {
          callbackRef.current({
            sourceId: result.id,
            name: result.participantName?.trim() ?? '',
            email: result.participantEmail?.trim() ?? '',
            job: getCareerName(result.topCareer),
            school: result.centerName?.trim() ?? '',
            goal: result.resultSummary?.trim() ?? '',
          });
        });
        actionCell.appendChild(button);
      });
    };

    attachButtons();
    const observer = new MutationObserver(attachButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [enabled, results]);

  return null;
}
