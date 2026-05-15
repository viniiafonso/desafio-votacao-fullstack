package com.cooperativa.votacao.entity;

import com.cooperativa.votacao.enums.TipoVoto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "votos",
        uniqueConstraints = @UniqueConstraint(name = "uk_voto_cpf_pauta", columnNames = {"cpf", "pauta_id"}),
        indexes = {
                @Index(name = "idx_voto_pauta", columnList = "pauta_id"),
                @Index(name = "idx_voto_cpf", columnList = "cpf")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pauta_id", nullable = false)
    private Pauta pauta;

    @Column(nullable = false, length = 11)
    private String cpf;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private TipoVoto voto;

    @CreationTimestamp
    @Column(name = "data_voto", nullable = false, updatable = false)
    private LocalDateTime dataVoto;
}
