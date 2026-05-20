# GLPY — Current Weight Screen V1

Status: APPROVED
Version: V1
Date: 2026-05-19

## Objetivo da Tela

Permitir que o usuário registre ou atualize seu peso atual de forma rápida, simples e sem fricção.

A tela deve seguir o padrão visual clean premium do GLPY, alinhada à Results Screen e às telas operacionais claras.

## Conceito Central

"Atualize seu peso para acompanhar sua evolução com precisão."

## Direção Visual

Tema:
- light premium
- branco clean
- wellness minimalista
- Apple Health aesthetic
- foco em simplicidade

Paleta:
- fundo branco
- cinza ultra claro
- verde GLPY
- texto navy escuro

## Estrutura da Tela

### Header

- botão voltar
- título: Peso Atual

### Headline

Qual é o seu peso atual?

### Subtexto

Atualize seu peso para acompanhar seu progresso com precisão.

### Campo Principal

Input digitável centralizado.

Exemplo:

80.0 kg

Regras:
- NÃO usar slider
- NÃO usar wheel picker
- usar campo digitável
- teclado numérico automático
- aceitar vírgula e ponto
- converter 80,5 para 80.5 internamente

### Unidade

A unidade deve respeitar a configuração global:

- cm / kg
- ft / lbs

### CTA

Botão principal:

Salvar

## Comportamento

Ao salvar:
- atualizar peso atual do usuário
- recalcular IMC
- recalcular progresso até a meta
- atualizar Results Screen
- atualizar Home Screen
- alimentar GLPY IA

## Arquivo Oficial

PNG:

assets/screens/operations/weight/current-weight-screen-v1.png

MD:

docs/current-weight-screen-v1.md

## Status Final

APPROVED — READY FOR IMPLEMENTATION
