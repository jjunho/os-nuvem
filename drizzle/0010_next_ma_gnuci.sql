CREATE TABLE "modelos_resposta" (
	"idioma" text PRIMARY KEY NOT NULL,
	"texto" text NOT NULL
);

--> statement-breakpoint
INSERT INTO modelos_resposta (idioma, texto) VALUES
('pt','Olá! Vamos planejar sua viagem.
{dados_faltantes}
Nossa equipe está na Coreia do Sul; considere a diferença de fuso horário ao aguardar nossa resposta.'),
('es','¡Hola! Vamos a planificar su viaje.
{dados_faltantes}
Nuestro equipo está en Corea del Sur; tenga en cuenta la diferencia horaria mientras espera nuestra respuesta.'),
('en','Hello! Let''s plan your trip.
{dados_faltantes}
Our team is in South Korea; please allow for the time difference while waiting for our reply.'),
('fr','Bonjour ! Préparons votre voyage.
{dados_faltantes}
Notre équipe est en Corée du Sud ; merci de tenir compte du décalage horaire en attendant notre réponse.');
