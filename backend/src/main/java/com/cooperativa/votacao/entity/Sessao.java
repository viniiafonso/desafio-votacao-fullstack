package com.cooperativa.votacao.entity;

import com.cooperativa.votacao.enums.StatusSessao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessoes",
        uniqueConstraints = @UniqueConstraint(name = "uk_sessao_pauta", columnNames = "pauta_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sessao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pauta_id", nullable = false)
    private Pauta pauta;

    @Column(nullable = false)
    private LocalDateTime inicio;

    @Column(nullable = false)
    private LocalDateTime fim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusSessao status;

    @Column(name = "tempo_restante_segundos")
    private Long tempoRestanteEmSegundos;

    @Column(name = "duracao_em_minutos")
    private Integer duracaoEmMinutos;

    public boolean estaAberta() {
        LocalDateTime agora = LocalDateTime.now();
        return status == StatusSessao.ABERTA
                && !agora.isBefore(inicio)
                && agora.isBefore(fim);
    }
}
