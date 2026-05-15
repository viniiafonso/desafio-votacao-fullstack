package com.cooperativa.votacao.repository;

import com.cooperativa.votacao.entity.Pauta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PautaRepository extends JpaRepository<Pauta, Long> {

    @Override
    @Query(value = "SELECT p FROM Pauta p LEFT JOIN FETCH p.sessao ORDER BY p.dataCriacao DESC",
            countQuery = "SELECT COUNT(p) FROM Pauta p")
    Page<Pauta> findAll(Pageable pageable);
}
