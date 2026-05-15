package com.cooperativa.votacao.mapper;

import com.cooperativa.votacao.dto.response.SessaoResponse;
import com.cooperativa.votacao.entity.Sessao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SessaoMapper {

    @Mapping(target = "pautaId", source = "pauta.id")
    SessaoResponse toResponse(Sessao sessao);
}
