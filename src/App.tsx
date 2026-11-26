import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CirclePlus,
  Clock3,
  Eye,
  Feather,
  FileText,
  LibraryBig,
  LoaderCircle,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { bookApi } from './services/api';
import type { Book, BookCreate, BookStatus, EntryCreate, EntryKind } from './types';

const tabs: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os livros' },
  { value: 'reading', label: 'Lendo' },
  { value: 'want-to-read', label: 'Quero ler' },
  { value: 'completed', label: 'Concluídos' },
];

const statusLabels: Record<BookStatus, string> = {
  reading: 'Lendo',
  'want-to-read': 'Quero ler',
  completed: 'Concluído',
};

const coverColors = [
  'from-[#d8e6d3] to-[#a5c19d]',
  'from-[#f1dfd0] to-[#d8a987]',
  'from-[#d9ddec] to-[#a5adc9]',
  'from-[#f2e7bd] to-[#d6bb73]',
  'from-[#e8d8df] to-[#c6a2b3]',
  'from-[#d5e5e3] to-[#93b9b1]',
];

function BookCard({ book, index, onLog, onViewNotes, onStatus }: {
  book: Book;
  index: number;
  onLog: (book: Book) => void;
  onViewNotes: (book: Book) => void;
  onStatus: (book: Book, status: BookStatus) => void;
}) {
  const progress = book.total_pages ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100)) : 0;
  const lastEntry = book.entries[book.entries.length - 1];
  return (
    <article className="group rounded-2xl border border-[#e9e9e4] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#d8ddd2] hover:shadow-[0_12px_30px_rgba(38,48,35,0.06)] sm:p-5">
      <div className="flex gap-4">
        <div className={`relative flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${coverColors[index % coverColors.length]} p-3 text-center shadow-[inset_5px_0_8px_rgba(40,40,30,0.12)]`}>
          <div className="absolute inset-y-0 left-2 w-px bg-white/40" />
          <BookOpen size={23} strokeWidth={1.4} className="absolute top-3 text-[#344b36]/55" />
          <span className="mt-7 line-clamp-4 font-serif text-[13px] font-semibold leading-4 text-[#263b2b]">{book.title}</span>
          <span className="absolute bottom-3 line-clamp-1 max-w-[72px] text-[9px] uppercase tracking-[0.12em] text-[#263b2b]/70">{book.author}</span>
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${book.status === 'completed' ? 'bg-[#eaf2e8] text-[#477346]' : book.status === 'reading' ? 'bg-[#f3efdf] text-[#967b38]' : 'bg-[#f0efed] text-[#777872]'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${book.status === 'completed' ? 'bg-[#6d9a69]' : book.status === 'reading' ? 'bg-[#c6a750]' : 'bg-[#a9aaa5]'}`} />
                {statusLabels[book.status]}
              </span>
              <h3 className="mt-2 line-clamp-2 font-serif text-lg font-semibold leading-6 text-[#292b26]">{book.title}</h3>
              <p className="mt-0.5 truncate text-xs text-[#8b8d85]">{book.author}</p>
            </div>
            {book.status === 'reading' && <span className="shrink-0 rounded-lg bg-[#f7f8f5] px-2 py-1 text-xs font-semibold text-[#557a56]">{progress}%</span>}
          </div>
          {book.status === 'reading' ? (
            <div className="mt-3">
              <div className="mb-1.5 flex justify-between text-[11px] text-[#92948c]">
                <span>Página {book.current_page} de {book.total_pages}</span>
                <span>{Math.max(0, book.total_pages - book.current_page)} restantes</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#eeefeb]">
                <div className="h-full rounded-full bg-[#6f936c] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#92948c]">
              {book.status === 'completed' ? <Check size={13} className="text-[#659064]" /> : <Clock3 size={13} />}
              {book.status === 'completed' ? `${book.total_pages} páginas lidas` : `${book.total_pages} páginas`}
            </div>
          )}
          {book.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {book.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-md bg-[#f7f7f4] px-2 py-1 text-[10px] text-[#75786f]">{tag}</span>)}
              {book.tags.length > 2 && <span className="px-1 py-1 text-[10px] text-[#989a93]">+{book.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex min-h-10 items-center justify-between border-t border-[#f0f0ec] pt-3">
        <p className="mr-3 line-clamp-1 text-[11px] text-[#92948c]">
          {lastEntry ? <><span className="font-medium text-[#686b63]">{lastEntry.kind === 'review' ? 'Resenha' : 'Última leitura'} · </span>{lastEntry.note || `${lastEntry.pages_read} páginas`} <span className="text-[#aaa]">· {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(lastEntry.created_at))}</span></> : 'Nenhuma anotação ainda'}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {book.status !== 'completed' && (
            <button type="button" onClick={() => onStatus(book, 'completed')} title="Marcar como concluído" className="grid h-8 w-8 place-items-center rounded-lg border border-[#e8e9e4] text-[#73766d] transition hover:border-[#cbdac8] hover:bg-[#eff5ed] hover:text-[#557a56]">
              <Check size={15} />
            </button>
          )}
          <button type="button" onClick={() => onViewNotes(book)} aria-label={`Ver anotações e resenhas de ${book.title}`} className="flex h-8 items-center gap-1 rounded-lg border border-[#e8e9e4] px-2 text-[11px] font-medium text-[#686b63] transition hover:border-[#cbdac8] hover:bg-[#eff5ed] hover:text-[#557a56]">
            <Eye size={14} /> Notas{book.entries.length > 0 ? ` (${book.entries.length})` : ''}
          </button>
          <button type="button" onClick={() => onLog(book)} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#557a56] px-3 text-xs font-medium text-white transition hover:bg-[#426843]">
            <CirclePlus size={14} /> Registrar
          </button>
        </div>
      </div>
    </article>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#242820]/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#72916d]">Entrelinhas</p>
            <h2 id="modal-title" className="mt-1 font-serif text-2xl font-semibold text-[#292b26]">{title}</h2>
          </div>
          <button onClick={onClose} type="button" aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f2] text-[#797b74] hover:bg-[#eeefeb]"><X size={17} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'book' | 'entry' | 'notes' | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [entryKind, setEntryKind] = useState<EntryKind>('progress');

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const [visibleBooks, libraryBooks] = await Promise.all([
        bookApi.list(search, activeTab),
        bookApi.list('', 'all'),
      ]);
      setBooks(visibleBooks);
      setAllBooks(libraryBooks);
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Erro ao carregar seus livros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchBooks(); }, search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [search, activeTab]);

  const summary = useMemo(() => ({
    total: allBooks.length,
    reading: allBooks.filter((book) => book.status === 'reading').length,
    completed: allBooks.filter((book) => book.status === 'completed').length,
    pages: allBooks.reduce((total, book) => total + book.current_page, 0),
  }), [allBooks]);

  async function handleCreateBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: BookCreate = {
      title: String(form.get('title')).trim(),
      author: String(form.get('author')).trim(),
      total_pages: Number(form.get('total_pages')),
      tags: String(form.get('tags')).split(',').map((tag) => tag.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      await bookApi.create(payload);
      setModal(null);
      await fetchBooks();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível cadastrar o livro.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBook) return;
    const form = new FormData(event.currentTarget);
    const payload: EntryCreate = {
      kind: entryKind,
      pages_read: entryKind === 'progress' ? Number(form.get('pages_read') || 0) : 0,
      note: String(form.get('note')).trim(),
    };
    setSaving(true);
    try {
      await bookApi.addEntry(selectedBook.id, payload);
      setModal(null);
      setSelectedBook(null);
      await fetchBooks();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível salvar o registro.');
    } finally {
      setSaving(false);
    }
  }

  async function markAsCompleted(book: Book) {
    setSaving(true);
    try {
      await bookApi.updateStatus(book.id, 'completed');
      await fetchBooks();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível atualizar o livro.');
    } finally {
      setSaving(false);
    }
  }

  const openEntry = (book: Book) => {
    setSelectedBook(book);
    setEntryKind('progress');
    setModal('entry');
  };

  const openNotes = (book: Book) => {
    setSelectedBook(book);
    setModal('notes');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#292b26]">
      <header className="border-b border-[#e9e9e4] bg-[#fbfbfa]">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#" className="flex items-center gap-2.5 no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#557a56] text-white"><BookOpen size={19} /></span>
            <span className="font-serif text-[19px] font-semibold tracking-tight">entrelinhas<span className="text-[#739270]">.</span></span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#92948c] sm:block">Um cantinho para suas leituras</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e6ece2] text-xs font-semibold text-[#557a56]">LE</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <section className="relative overflow-hidden pb-8 pt-10 sm:pb-10 sm:pt-14">
          <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full border border-[#e8e9e3] sm:right-12 sm:top-0">
            <div className="absolute inset-7 rounded-full border border-[#e8e9e3]" />
            <div className="absolute inset-14 rounded-full border border-[#e8e9e3]" />
          </div>
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e4e8df] bg-white/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#668364]">
              <Sparkles size={12} /> Seu diário de leitura
            </div>
            <h1 className="max-w-2xl font-serif text-[36px] font-medium leading-[1.08] tracking-[-0.04em] text-[#282b25] sm:text-[52px]">
              Cada página conta<br className="hidden sm:block" /> uma <span className="italic text-[#6f8c69]">história.</span>
            </h1>
            <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <p className="max-w-md text-sm leading-6 text-[#85877f]">Guarde suas leituras, acompanhe seu progresso e registre as ideias que ficam com você.</p>
              <button onClick={() => setModal('book')} className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#557a56] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#426843] sm:self-auto">
                <CirclePlus size={17} /> Adicionar livro
              </button>
            </div>
          </div>
        </section>

        <section aria-label="Resumo das leituras" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard label="Na biblioteca" value={summary.total} icon={<LibraryBig size={17} />} trend="+ sua coleção" />
          <StatCard label="Em andamento" value={summary.reading} icon={<BookOpen size={17} />} trend="leituras ativas" />
          <StatCard label="Finalizados" value={summary.completed} icon={<Check size={17} />} trend="histórias vividas" />
          <StatCard label="Páginas lidas" value={summary.pages.toLocaleString('pt-BR')} icon={<Feather size={17} />} trend="e contando" />
        </section>

        <section className="mt-10 sm:mt-12">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#90928a]"><span className="h-px w-5 bg-[#9eaf99]" />Minha estante</div>
              <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#292b26]">Sua biblioteca</h2>
            </div>
            <label className="relative block w-full sm:max-w-[270px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3a59e]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar título, autor ou tag..." className="h-10 w-full rounded-xl border border-[#e8e9e4] bg-white pl-10 pr-4 text-xs text-[#41433d] outline-none transition placeholder:text-[#a3a59e] focus:border-[#9db198]" />
            </label>
          </div>

          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#e8e9e4]">
            {tabs.map((tab) => (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`relative shrink-0 px-3 py-2.5 text-xs transition ${activeTab === tab.value ? 'font-semibold text-[#557a56]' : 'text-[#92948c] hover:text-[#55584f]'}`}>
                {tab.label}
                {activeTab === tab.value && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#6f8c69]" />}
              </button>
            ))}
            <span className="ml-auto hidden items-center gap-1 pb-2 text-[11px] text-[#a0a199] sm:flex"><Tag size={12} /> Tags nos livros</span>
          </div>

          {error && (
            <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-[#edd9d4] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b5145]">
              <span>{error}</span><button aria-label="Fechar aviso" onClick={() => setError('')}><X size={16} /></button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-[#85877f]"><LoaderCircle size={18} className="animate-spin" /> Carregando sua estante...</div>
          ) : books.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {books.map((book, index) => <BookCard key={book.id} book={book} index={index} onLog={openEntry} onViewNotes={openNotes} onStatus={markAsCompleted} />)}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dfe2d9] bg-[#fbfbfa] px-6 text-center">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#edf2ea] text-[#6f8c69]"><BookOpen size={22} /></span>
              <h3 className="font-serif text-lg font-semibold text-[#42443e]">{search ? 'Nenhum livro encontrado' : 'Sua estante começa aqui'}</h3>
              <p className="mt-1 max-w-sm text-xs leading-5 text-[#92948c]">{search ? 'Tente outro título, autor ou tag.' : 'Cadastre seu primeiro livro e comece a guardar o caminho de cada leitura.'}</p>
              {!search && <button onClick={() => setModal('book')} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#557a56] hover:text-[#426843]"><CirclePlus size={14} /> Cadastrar meu primeiro livro</button>}
            </div>
          )}
        </section>

        <footer className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-[#e9e9e4] pt-5 text-[11px] text-[#a0a199] sm:flex-row">
          <span>Feito para lembrar do que os livros despertam.</span>
          <span className="flex items-center gap-1.5"><FileText size={13} /> Um capítulo de cada vez <ArrowUpRight size={12} /></span>
        </footer>
      </main>

      {modal === 'book' && (
        <Modal title="Novo livro na estante" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateBook} className="space-y-4">
            <Field label="Título do livro"><input required name="title" maxLength={160} placeholder="Ex.: A biblioteca da meia-noite" className="form-input" /></Field>
            <Field label="Autor"><input required name="author" maxLength={120} placeholder="Nome do autor ou autora" className="form-input" /></Field>
            <Field label="Total de páginas"><input required name="total_pages" type="number" min="1" max="100000" placeholder="Ex.: 320" className="form-input" /></Field>
            <Field label="Tags" hint="Separe por vírgula"><input name="tags" maxLength={300} placeholder="ficção, favorito, clube do livro" className="form-input" /></Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="h-11 flex-1 rounded-xl border border-[#e8e9e4] text-sm font-medium text-[#73766d] hover:bg-[#f8f8f6]">Cancelar</button>
              <button disabled={saving} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#557a56] text-sm font-medium text-white hover:bg-[#426843] disabled:opacity-60">
                {saving && <LoaderCircle size={15} className="animate-spin" />} Adicionar livro
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'entry' && selectedBook && (
        <Modal title="Registrar leitura" onClose={() => { setModal(null); setSelectedBook(null); }}>
          <p className="mb-5 truncate text-sm text-[#85877f]">Anotação para <span className="font-medium text-[#4c5148]">{selectedBook.title}</span></p>
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-[#f5f6f3] p-1">
            <button type="button" onClick={() => setEntryKind('progress')} className={`rounded-lg py-2.5 text-xs font-medium transition ${entryKind === 'progress' ? 'bg-white text-[#557a56] shadow-sm' : 'text-[#85877f]'}`}>Progresso</button>
            <button type="button" onClick={() => setEntryKind('review')} className={`rounded-lg py-2.5 text-xs font-medium transition ${entryKind === 'review' ? 'bg-white text-[#557a56] shadow-sm' : 'text-[#85877f]'}`}>Resenha / nota</button>
          </div>
          <form onSubmit={handleCreateEntry} className="space-y-4">
            {entryKind === 'progress' && <Field label="Páginas lidas nesta sessão"><input name="pages_read" type="number" min="0" max={selectedBook.total_pages - selectedBook.current_page} defaultValue="10" className="form-input" /><span className="mt-1 block text-[11px] text-[#999b94]">Você está na página {selectedBook.current_page} de {selectedBook.total_pages}.</span></Field>}
            <Field label={entryKind === 'review' ? 'Sua resenha' : 'Anotação (opcional)'}>
              <textarea name="note" rows={4} maxLength={3000} required={entryKind === 'review'} placeholder={entryKind === 'review' ? 'O que ficou com você depois dessa leitura?' : 'Uma ideia, trecho ou impressão para guardar...'} className="form-input resize-none" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setModal(null); setSelectedBook(null); }} className="h-11 flex-1 rounded-xl border border-[#e8e9e4] text-sm font-medium text-[#73766d] hover:bg-[#f8f8f6]">Cancelar</button>
              <button disabled={saving} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#557a56] text-sm font-medium text-white hover:bg-[#426843] disabled:opacity-60">
                {saving && <LoaderCircle size={15} className="animate-spin" />} Salvar registro
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'notes' && selectedBook && (
        <Modal title="Anotações e resenhas" onClose={() => { setModal(null); setSelectedBook(null); }}>
          <p className="mb-5 truncate text-sm text-[#85877f]">
            Seu histórico de leitura de <span className="font-medium text-[#4c5148]">{selectedBook.title}</span>
          </p>
          {selectedBook.entries.length > 0 ? (
            <div className="space-y-3">
              {[...selectedBook.entries].reverse().map((entry) => (
                <article key={entry.id} className="rounded-xl border border-[#ecece7] bg-[#fbfbfa] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${entry.kind === 'review' ? 'bg-[#f0eaf2] text-[#795d83]' : 'bg-[#edf3e9] text-[#557a56]'}`}>
                      {entry.kind === 'review' ? 'Resenha' : 'Sessão de leitura'}
                    </span>
                    <time className="text-[11px] text-[#92948c]">
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.created_at))}
                    </time>
                  </div>
                  {entry.kind === 'progress' && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#668364]">
                      <BookOpen size={14} />
                      {entry.pages_read > 0 ? `${entry.pages_read} ${entry.pages_read === 1 ? 'página lida' : 'páginas lidas'}` : 'Registro de leitura'}
                    </p>
                  )}
                  {entry.note ? (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#55584f]">{entry.note}</p>
                  ) : (
                    <p className="mt-2 text-xs italic text-[#a0a199]">Nenhuma anotação nesta sessão.</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#dfe2d9] bg-[#fbfbfa] px-5 py-8 text-center">
              <FileText size={22} className="mx-auto text-[#8ba185]" />
              <p className="mt-3 font-medium text-sm text-[#55584f]">Ainda não há anotações</p>
              <p className="mt-1 text-xs text-[#92948c]">Use “Registrar” no cartão para guardar uma sessão ou resenha.</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string; value: string | number; icon: React.ReactNode; trend: string }) {
  return (
    <div className="rounded-2xl border border-[#e9e9e4] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#898b83]">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f4ef] text-[#6d8b68]">{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-serif text-3xl font-semibold tracking-tight text-[#30332d]">{value}</span>
        <span className="text-[10px] text-[#a0a199]">{trend}</span>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#55584f]">{label}{hint && <span className="font-normal text-[#a0a199]">{hint}</span>}</span>
      {children}
    </label>
  );
}

export default App;
