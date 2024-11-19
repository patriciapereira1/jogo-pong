let bolaImagem;
let jogadorImagem;
let computadorImagem;
let fundoImagem;
let quicarSom;
let golSom;

let pontosJogador = 0;
let pontosComputador = 0;
let jogoIniciado = false;
let jogoPausado = false;
let dificuldade = 'médio'; 

class Raquete {
    constructor(x) {
        this.x = x;
        this.y = height / 2;
        this.w = 10;
        this.h = 60;
    }

    update() {
        if (this.x < width / 2) {
            this.y = mouseY;
        } else {
            let velocidade;

            // velocidade da raquete do computador conforme a dificuldade
            if (dificuldade === 'fácil') {
                velocidade = 3;
            } else if (dificuldade === 'médio') {
                velocidade = 5;
            } else if (dificuldade === 'difícil') {
                velocidade = 7;
            }

            if (bola.y < this.y) {
                this.y -= velocidade;
            } else {
                this.y += velocidade;
            }
        }

        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y > height - this.h) {
            this.y = height - this.h;
        }
    }

    desenha() {
        if (this.x < width / 2) {
            image(jogadorImagem, this.x, this.y, this.w, this.h);
        } else {
            image(computadorImagem, this.x, this.y, this.w, this.h);
        }
    }
}

class Bola {
    constructor() {
        this.r = 12;
        this.reset();
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        let velocidadeMaxima;

        // velocidade máxima conforme a dificuldade
        if (dificuldade === 'fácil') {
            velocidadeMaxima = 3;
        } else if (dificuldade === 'médio') {
            velocidadeMaxima = 5;
        } else if (dificuldade === 'difícil') {
            velocidadeMaxima = 7;
        }

        this.vx = Math.random() * (velocidadeMaxima * 2) - velocidadeMaxima;
        this.vy = Math.random() * (velocidadeMaxima * 2) - velocidadeMaxima;

        if (Math.random() > 0.5) this.vx *= -1;
        if (Math.random() > 0.5) this.vy *= -1;

        this.angulo = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angulo += Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 30;

        if (this.x < this.r || this.x > width - this.r) {
            if (this.x < this.r) {
                pontosComputador++;
            } else {
                pontosJogador++;
            }
            golSom.play();
            falaPontos();
            this.reset();
        }
        if (this.y < this.r || this.y > height - this.r) {
            this.vy *= -1;
        }
        if (colideRetanguloCirculo(this.x, this.y, this.r, jogador.x, jogador.y, jogador.w, jogador.h) ||
            colideRetanguloCirculo(this.x, this.y, this.r, computador.x, computador.y, computador.w, computador.h)) {
            quicarSom.play();
            this.vx *= -1;
            this.vx *= 1.1;
            this.vy *= 1.1;
        }
    }

    desenha() {
        push();
        translate(this.x, this.y);
        rotate(this.angulo);
        image(bolaImagem, -this.r, -this.r, this.r * 2, this.r * 2);
        pop();
    }
}

function colideRetanguloCirculo(cx, cy, raio, x, y, w, h) {
    if (cx + raio < x || cx - raio > x + w) {
        return false;
    }
    if (cy + raio < y || cy - raio > y + h) {
        return false;
    }
    return true;
}

let bola;
let jogador;
let computador;

function falaPontos() {
    if ('speechSynthesis' in window) {
        const pontuacao = "Pontuação é " + pontosJogador + " a " + pontosComputador;
        const msg = new SpeechSynthesisUtterance(pontuacao);
        msg.lang = 'pt-BR';
        window.speechSynthesis.speak(msg);
    }
}

function preload() {
    bolaImagem = loadImage('bola.png');
    jogadorImagem = loadImage('barra01.png');
    computadorImagem = loadImage('barra02.png');
    fundoImagem = loadImage('fundo2.png');
    quicarSom = loadSound('446100__justinvoke__bounce.wav');
    golSom = loadSound('274178__littlerobotsoundfactory__jingle_win_synth_02.wav');
}

function setup() {
    createCanvas(800, 400);
    bola = new Bola();
    jogador = new Raquete(30);
    computador = new Raquete(width - 30 - 10);

    // Criar seletor de dificuldade
    let seletorDificuldade = createSelect();
    seletorDificuldade.option('fácil');
    seletorDificuldade.option('médio');
    seletorDificuldade.option('difícil');
    seletorDificuldade.position((width / 2)  - 60, (height / 2)  + 150);
    seletorDificuldade.class('seletor-dificuldade');
    seletorDificuldade.changed(() => {
        dificuldade = seletorDificuldade.value();
    });

    // Botão de iniciar jogo
    let botaoIniciar = createButton('Iniciar Jogo');
    botaoIniciar.position((width / 2) + 150, (height / 2) + 150); 
    botaoIniciar.class('botao-iniciar');
    botaoIniciar.mousePressed(() => {
        jogoIniciado = true;
        botaoIniciar.hide();
        seletorDificuldade.hide();
        botaoPausar.style('display', 'inline-block');
        bola.reset();
    });

    // Botão de pausar jogo
    let botaoPausar = createButton('Pausar Jogo');
    botaoPausar.position((width / 2) + 200, (height / 2) + 300);
    botaoPausar.class('botao-pausar');
    botaoPausar.style('display', 'none');
    botaoPausar.mousePressed(() => {
        jogoPausado = !jogoPausado;
        botaoPausar.html(jogoPausado ? 'Continuar Jogo' : 'Pausar Jogo');
    });
}

function draw() {
    let canvasAspectRatio = width / height;
    let fundoAspectRatio = fundoImagem.width / fundoImagem.height;
    let zoom = canvasAspectRatio > fundoAspectRatio ? width / fundoImagem.width : height / fundoImagem.height;
    let scaledWidth = fundoImagem.width * zoom;
    let scaledHeight = fundoImagem.height * zoom;
    image(fundoImagem, (width - scaledWidth) / 2, (height - scaledHeight) / 2, scaledWidth, scaledHeight);

    if (jogoIniciado && !jogoPausado) {
        bola.update();
        bola.desenha();
        jogador.update();
        jogador.desenha();
        computador.update();
        computador.desenha();
    }

    // Desenhar placar
    fill(255);
    textSize(32);
    textAlign(CENTER, TOP);
    text(`Jogador: ${pontosJogador} - Computador: ${pontosComputador}`, width / 2, 10);
}
