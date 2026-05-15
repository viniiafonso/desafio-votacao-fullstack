package com.cooperativa.votacao.repository;

import com.cooperativa.votacao.entity.Sessao;
import com.cooperativa.votacao.enums.StatusSessao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, Long> {

    Optional<Sessao> findByPautaId(Long pautaId);

    boolean existsByPautaId(Long pautaId);

    @Modifying
    @Query("UPDATE Sessao s SET s.status = :status WHERE s.status = com.cooperativa.votacao.enums.StatusSessao.ABERTA AND s.fim <= :agora")
    int encerrarSessoesExpiradas(@Param("status") StatusSessao status, @Param("agora") LocalDateTime agora);
}
