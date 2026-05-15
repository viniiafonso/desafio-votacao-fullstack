package com.cooperativa.votacao.repository;

import com.cooperativa.votacao.entity.Voto;
import com.cooperativa.votacao.enums.TipoVoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VotoRepository extends JpaRepository<Voto, Long> {

    boolean existsByPautaIdAndCpf(Long pautaId, String cpf);

    @Query("SELECT v.voto AS tipo, COUNT(v) AS total FROM Voto v WHERE v.pauta.id = :pautaId GROUP BY v.voto")
    List<ContagemVotos> contarVotosPorTipo(@Param("pautaId") Long pautaId);

    interface ContagemVotos {
        TipoVoto getTipo();

        Long getTotal();
    }
}
