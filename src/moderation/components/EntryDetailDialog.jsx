'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Link as MuiLink,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StatusChip from './StatusChip';
import { resourceLabel, resourceIcon } from '../resources';
import { getEntryFiles } from '../api/moderation';
import {
  fieldLabel,
  formatValue,
  formatDate,
  hrefFor,
  mediaUrl,
} from '../utils/format';

// Рендер одного значения поля: ссылки → <a>, вложенные объекты → список,
// остальное — отформатированная строка (даты/деньги/булевы — см. formatValue).
function FieldValue({ name, value }) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const sub = Object.entries(value);
    if (sub.length === 0) return <span>—</span>;
    return (
      <Stack spacing={0.5}>
        {sub.map(([k, v]) => (
          <Box key={k} sx={{ fontSize: 13 }}>
            <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
              {fieldLabel(k)}:
            </Box>
            {formatValue(v, k)}
          </Box>
        ))}
      </Stack>
    );
  }
  const href = hrefFor(name, value);
  if (href) {
    return (
      <MuiLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ wordBreak: 'break-all' }}
      >
        {String(value)}
      </MuiLink>
    );
  }
  return <span>{formatValue(value, name)}</span>;
}

// Диалог подробного просмотра записи. onModerate(action, reason) вызывается
// при одобрении/отклонении; кнопки блокируются на время запроса (busy).
export default function EntryDetailDialog({ entry, open, onClose, onModerate, busy }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Медиа храним вместе с ключом записи, чтобы состояние загрузки выводить
  // производным образом (без синхронного setState в теле эффекта).
  const [mediaState, setMediaState] = useState({ key: null, items: [] });
  const [lightbox, setLightbox] = useState(-1); // индекс открытого медиа, -1 — закрыт

  const entryKey = entry ? `${entry.resourceType}-${entry.id}` : null;

  // Загружаем фото/видео записи при открытии диалога / смене записи.
  useEffect(() => {
    if (!open || !entry) return undefined;
    let active = true;
    const key = `${entry.resourceType}-${entry.id}`;
    getEntryFiles(entry.resourceType, entry.id).then((files) => {
      if (!active) return;
      const items = (Array.isArray(files) ? files : [])
        .map((f) => ({
          url: mediaUrl(f.path || f.url || f.location),
          video: typeof f.mimetype === 'string' && f.mimetype.startsWith('video'),
        }))
        .filter((m) => m.url);
      setMediaState({ key, items });
    });
    return () => {
      active = false;
    };
  }, [open, entry]);

  const media = mediaState.key === entryKey ? mediaState.items : [];
  const mediaLoading = Boolean(entry) && open && mediaState.key !== entryKey;

  if (!entry) return null;

  const handleClose = () => {
    setRejecting(false);
    setReason('');
    setError('');
    setLightbox(-1);
    onClose();
  };

  const handleApprove = async () => {
    setError('');
    try {
      await onModerate('approve');
      handleClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Укажите причину отклонения');
      return;
    }
    setError('');
    try {
      await onModerate('reject', reason.trim());
      handleClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const dataEntries = Object.entries(entry.data || {});
  const createdAt =
    entry.createdAt || entry.data?.created_at || entry.data?.createdAt;

  const stepLightbox = (dir) =>
    setLightbox((i) => (i + dir + media.length) % media.length);

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <span style={{ fontSize: 22 }}>{resourceIcon(entry.resourceType)}</span>
            <span>{resourceLabel(entry.resourceType)}</span>
            <Box sx={{ flexGrow: 1 }} />
            <StatusChip status={entry.status} />
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Поставщик
          </Typography>
          <Typography variant="body2">
            {entry.supplier?.fullName || '—'} · {entry.supplier?.email || '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Создано: {formatDate(createdAt)}
          </Typography>

          {/* Фото и видео записи */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Фото и видео
          </Typography>
          {mediaLoading ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Загрузка медиа…
              </Typography>
            </Stack>
          ) : media.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Нет прикреплённых фото и видео
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 1,
              }}
            >
              {media.map((m, i) => (
                <Box
                  key={i}
                  onClick={() => setLightbox(i)}
                  sx={{
                    position: 'relative',
                    height: 120,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'zoom-in',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#000',
                  }}
                >
                  {m.video ? (
                    <>
                      <video
                        src={m.url}
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 40, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.6))' }} />
                      </Box>
                    </>
                  ) : (
                    <Box
                      component="img"
                      src={m.url}
                      alt={`Медиа ${i + 1}`}
                      loading="lazy"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Данные записи
          </Typography>
          <Table size="small">
            <TableBody>
              {dataEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2}>Нет данных</TableCell>
                </TableRow>
              ) : (
                dataEntries.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell
                      sx={{ fontWeight: 600, width: '40%', verticalAlign: 'top' }}
                    >
                      {fieldLabel(key)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                      <FieldValue name={key} value={value} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {entry.status === 'rejected' && entry.rejectionReason && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Причина отклонения: {entry.rejectionReason}
            </Alert>
          )}

          {rejecting && (
            <TextField
              label="Причина отклонения"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={2}
              fullWidth
              autoFocus
              sx={{ mt: 2 }}
            />
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {rejecting ? (
            <>
              <Button onClick={() => setRejecting(false)} disabled={busy}>
                Назад
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleReject}
                disabled={busy}
                startIcon={<CancelIcon />}
              >
                Подтвердить отклонение
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleClose} disabled={busy}>
                Закрыть
              </Button>
              {entry.status !== 'rejected' && (
                <Button
                  color="error"
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  startIcon={<CancelIcon />}
                >
                  Отклонить
                </Button>
              )}
              {entry.status !== 'approved' && (
                <Button
                  color="success"
                  variant="contained"
                  onClick={handleApprove}
                  disabled={busy}
                  startIcon={<CheckCircleIcon />}
                >
                  Одобрить
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Лайтбокс: увеличенный просмотр фото/видео */}
      <Dialog
        open={lightbox >= 0 && lightbox < media.length}
        onClose={() => setLightbox(-1)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.92)', boxShadow: 'none' } }}
      >
        <Box sx={{ position: 'relative', minHeight: 200 }}>
          <IconButton
            onClick={() => setLightbox(-1)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2 }}
          >
            <CloseIcon />
          </IconButton>

          {media.length > 1 && (
            <>
              <IconButton
                onClick={() => stepLightbox(-1)}
                sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', color: '#fff', zIndex: 2 }}
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
              <IconButton
                onClick={() => stepLightbox(1)}
                sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', color: '#fff', zIndex: 2 }}
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </>
          )}

          {lightbox >= 0 && media[lightbox] && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                minHeight: '60vh',
              }}
            >
              {media[lightbox].video ? (
                <video
                  src={media[lightbox].url}
                  controls
                  autoPlay
                  style={{ maxWidth: '100%', maxHeight: '80vh' }}
                />
              ) : (
                <Box
                  component="img"
                  src={media[lightbox].url}
                  alt={`Медиа ${lightbox + 1}`}
                  sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                />
              )}
            </Box>
          )}

          {media.length > 1 && (
            <Typography
              sx={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: '#fff' }}
            >
              {lightbox + 1} / {media.length}
            </Typography>
          )}
        </Box>
      </Dialog>
    </>
  );
}
