package com.cooperativa.votacao.mapper;

import com.cooperativa.votacao.dto.request.CriarPautaRequest;
import com.cooperativa.votacao.dto.response.PautaResponse;
import com.cooperativa.votacao.entity.Pauta;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = SessaoMapper.class)
public interface PautaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "sessao", ignore = true)
    Pauta toEntity(CriarPautaRequest request);

    PautaResponse toResponse(Pauta pauta);
}
