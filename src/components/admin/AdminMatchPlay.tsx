/**
 * AdminMatchPlay
 * ---------------------------------------------------------------------------
 * Panel admin para capturar ganadores y resetear matches de las categorías
 * MATCH PLAY del torneo. Mismo flujo categoría → bracket que la página
 * pública /matchplay, pero con controles para set_winner / reset_match.
 *
 * La propagación (avance del ganador y movimiento del perdedor a D2) la
 * maneja el sistema legacy externo; este panel sólo escribe el resultado
 * del match individual.
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Medal, Swords, Trophy } from 'lucide-react';
import {
  useMatchPlayCategories,
  useMatchPlayBracket,
  useSetMatchWinner,
  useResetMatch,
  useEnableThirdPlace,
  type BracketMatch,
} from '@/hooks/useMatchPlay';
import BracketView from '@/components/matchplay/BracketView';
import { useToast } from '@/hooks/use-toast';

const AdminMatchPlay = () => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [busyMatch, setBusyMatch] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: categories = [], isLoading: loadingCats } = useMatchPlayCategories();
  const { data: bracket, isLoading: loadingBracket } = useMatchPlayBracket(selectedCatId);
  const setWinner = useSetMatchWinner();
  const resetMatch = useResetMatch();
  const enableThirdPlace = useEnableThirdPlace();

  const selectedCat = categories.find(c => c.categoryId === selectedCatId) || null;
  const hasD2 = !!bracket?.d2?.length;
  /**
   * ¿El bracket ya tiene match por 3er lugar habilitado? Se detecta por la
   * presencia de una fila con `matchId % 100 === 99` en d1. Si existe,
   * ocultamos el botón para no ofrecer una acción que ya no aplica.
   */
  const hasThirdPlaceD1 = !!bracket?.d1?.some(m => (m.matchId % 100) === 99);
  /** Sólo tiene sentido para brackets con ≥3 matches D1 (≥2 semis + 1 final). */
  const canEnableThirdPlaceD1 = !hasThirdPlaceD1 && (bracket?.d1?.length ?? 0) >= 3;

  /** Aplica set_winner y notifica vía toast. `side` = 1 ó 2 (player1/player2). */
  const handleSetWinner = async (match: BracketMatch, side: 1 | 2) => {
    const winnerId = side === 1 ? match.player1.id : match.player2.id;
    if (winnerId == null) {
      toast({ title: 'Sin jugador', description: 'Ese lado aún no tiene jugador asignado.', variant: 'destructive' });
      return;
    }
    setBusyMatch(match.matchId);
    try {
      await setWinner.mutateAsync({
        catid: selectedCatId!,
        matchx: match.matchId,
        side,
      });
      toast({ title: 'Ganador registrado', description: `Match ${match.matchId}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Falló set_winner', variant: 'destructive' });
    } finally {
      setBusyMatch(null);
    }
  };

  /** Aplica reset_match y notifica. */
  const handleReset = async (match: BracketMatch) => {
    setBusyMatch(match.matchId);
    try {
      await resetMatch.mutateAsync({ catid: selectedCatId!, matchx: match.matchId });
      toast({ title: 'Match reseteado', description: `Match ${match.matchId}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Falló reset', variant: 'destructive' });
    } finally {
      setBusyMatch(null);
    }
  };

  /** Habilita el match por 3er lugar en la categoría D1 seleccionada. */
  const handleEnableThirdPlace = async () => {
    if (!selectedCatId) return;
    try {
      await enableThirdPlace.mutateAsync({ catid: selectedCatId });
      toast({ title: 'Match por 3er lugar habilitado', description: 'Ya se puede capturar el resultado.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Falló habilitación', variant: 'destructive' });
    }
  };

  if (loadingCats) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Swords className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          Este torneo no tiene categorías Match Play con jugadores.
        </p>
      </div>
    );
  }

  if (!selectedCatId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Selecciona una categoría para capturar resultados de su bracket.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Card
              key={cat.categoryId}
              className="cursor-pointer hover:border-primary transition"
              onClick={() => setSelectedCatId(cat.categoryId)}
            >
              <CardContent className="p-4 text-center">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="font-semibold">{cat.shortName || cat.categoryName}</div>
                <div className="text-xs text-muted-foreground">
                  {cat.playerCount} {cat.isParejas ? 'parejas' : 'jug.'} · {cat.matchCount} matches
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => setSelectedCatId(null)}
          className="gap-2 bg-primary/10 hover:bg-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h3 className="text-lg font-semibold">{selectedCat?.categoryName}</h3>
        {/* Botón para crear la fila matchx=199 + linkear semis. Sólo se ve
            cuando el bracket tiene tamaño suficiente y aún no está habilitado. */}
        {canEnableThirdPlaceD1 ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={enableThirdPlace.isPending}
            onClick={handleEnableThirdPlace}
          >
            <Medal className="h-4 w-4" />
            {enableThirdPlace.isPending ? 'Habilitando…' : 'Habilitar 3er lugar'}
          </Button>
        ) : (
          <div className="w-20" />
        )}
      </div>
      {loadingBracket || !bracket ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : hasD2 ? (
        <Tabs defaultValue="d1">
          <TabsList>
            {/* DRAW-1 = matches 101..115 | DRAW-2 = matches 201..215 */}
            <TabsTrigger value="d1">MATCH-1</TabsTrigger>
            <TabsTrigger value="d2">MATCH-2</TabsTrigger>
          </TabsList>
          <TabsContent value="d1" className="mt-4">
            <BracketView
              matches={bracket.d1}
              admin
              onSetWinner={handleSetWinner}
              onReset={handleReset}
              busyMatchId={busyMatch}
            />
          </TabsContent>
          <TabsContent value="d2" className="mt-4">
            <BracketView
              matches={bracket.d2}
              admin
              onSetWinner={handleSetWinner}
              onReset={handleReset}
              busyMatchId={busyMatch}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <BracketView
          matches={bracket.d1}
          admin
          onSetWinner={handleSetWinner}
          onReset={handleReset}
          busyMatchId={busyMatch}
        />
      )}
    </div>
  );
};

export default AdminMatchPlay;