package com.cooperativa.votacao.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI votacaoOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Votacao Cooperativista")
                        .version("v1")
                        .description("API REST para gerenciamento de pautas, sessoes de votacao e contabilizacao de votos em cooperativas.")
                        .contact(new Contact()
                                .name("Cooperativa")
                                .email("contato@cooperativa.com.br"))
                        .license(new License().name("MIT").url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local"),
                        new Server().url("/").description("Default")
                ));
    }
}
