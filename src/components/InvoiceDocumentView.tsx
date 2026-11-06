import React from 'react';
import { Invoice } from '../types';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoiceDocumentView({ invoice, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
        <h3 className="font-bold text-lg mb-2">Fatura {invoice?.invoiceNumber}</h3>
        <p className="text-sm text-gray-600 mb-4">Visualização de fatura indisponível.</p>
        <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#211a14] text-white font-bold text-sm">Fechar</button>
      </div>
    </div>
  );
}
