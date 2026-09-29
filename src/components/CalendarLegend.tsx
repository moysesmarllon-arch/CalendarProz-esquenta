import React from 'react';
import { Star, BookOpen, Coffee, AlertTriangle, Lock, Calendar } from 'lucide-react';

export const CalendarLegend: React.FC = () => {
  return (
    <div className="bg-[#FFFFFF] rounded-[16px] border border-[#EFEFEF] card-shadow p-4 sm:p-5 mb-6">
      <h3 className="text-xs font-bold uppercase tracking-[0.05em] text-[#FF7F00] mb-3">
        Legenda de cores e símbolos
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
        {/* Aula Inaugural */}
        <div className="flex items-center gap-2 p-2 rounded-[10px] bg-[#FFF3E5] border border-[#FF7F00]/20">
          <div className="w-6 h-6 rounded-[8px] bg-[#FF7F00] text-[#FFFFFF] flex items-center justify-center shrink-0">
            <Star className="w-3.5 h-3.5 fill-[#FFFFFF]" />
          </div>
          <div>
            <div className="font-bold text-[#131313]">Aula Inaugural</div>
            <div className="text-[10px] text-[#5D5F69]">Primeiro encontro</div>
          </div>
        </div>

        {/* Aula Regular */}
        <div className="flex items-center gap-2 p-2 rounded-[10px] bg-[#EEE7F9] border border-[#8C52FF]/20">
          <div className="w-6 h-6 rounded-[8px] bg-[#8C52FF] text-[#FFFFFF] flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#131313]">Aula Confirmada</div>
            <div className="text-[10px] text-[#5D5F69]">Escala da turma</div>
          </div>
        </div>

        {/* Confirme com a unidade */}
        <div className="flex items-center gap-2 p-2 rounded-[10px] bg-[#FFF3E5] border border-[#FEC13D]">
          <div className="w-6 h-6 rounded-[8px] bg-[#FEC13D] text-[#131313] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-[#131313]" />
          </div>
          <div>
            <div className="font-bold text-[#131313]">Confirme c/ Unidade</div>
            <div className="text-[10px] text-[#5D5F69]">Feriado local</div>
          </div>
        </div>

        {/* Feriado / Sem aula */}
        <div className="flex items-center gap-2 p-2 rounded-[10px] bg-[#EFEFEF] border border-[#B1B3BB]/30">
          <div className="w-6 h-6 rounded-[8px] bg-[#B1B3BB] text-[#FFFFFF] flex items-center justify-center shrink-0">
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#131313]">Feriado / Sem Aula</div>
            <div className="text-[10px] text-[#5D5F69]">Sem atividades</div>
          </div>
        </div>

        {/* Hoje */}
        <div className="flex items-center gap-2 p-2 rounded-[10px] bg-[#FFFFFF] border-2 border-[#593493]">
          <div className="w-6 h-6 rounded-[8px] bg-[#593493] text-[#FFFFFF] flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#593493]">Hoje</div>
            <div className="text-[10px] text-[#5D5F69]">Borda roxa</div>
          </div>
        </div>

        {/* Em breve */}
        <div className="flex items-center gap-2 p-2 rounded-[10px] bg-[#EFEFEF]/60 border border-[#EFEFEF]">
          <div className="w-6 h-6 rounded-[8px] bg-[#B1B3BB] text-[#FFFFFF] flex items-center justify-center shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#5D5F69]">Em breve</div>
            <div className="text-[10px] text-[#B1B3BB]">Próximos meses</div>
          </div>
        </div>
      </div>
    </div>
  );
};
