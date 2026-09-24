import { defineTrack } from '../define'

export const generativeAi = defineTrack({
  id: 'track-generative-ai',
  title: 'Generative AI',
  description: 'How models learn to produce text, images, audio and video: autoregressive models, VAEs, GANs and diffusion, sampling and decoding, LoRA fine-tuning, evaluating generated content, responsible generation, and building applications on top.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🎨',
  tags: ['generative-ai', 'diffusion', 'gan', 'vae', 'stable-diffusion', 'lora', 'text-generation', 'multimodal'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-deep-learning'],
  style: 'practice',
  categories: [
    {
      title: 'Foundations of Generative Modelling',
      description: 'What it means to learn a distribution rather than a label.',
      topics: [
        {
          title: 'What generative models learn',
          description: 'Discriminative models learn p(y|x); generative models learn p(x) or p(x|c) well enough to sample new data. The three abilities (sampling, likelihood, representation) and why no family delivers all three cheaply.',
          concepts: ['Discriminative versus generative', 'Sampling, likelihood and representation', 'Explicit versus implicit density', 'The generative trilemma'],
          quiz: [
            ['Which family gives exact likelihoods?', 'Autoregressive models and normalising flows.'],
            ['Do GANs give a likelihood?', 'No, they are implicit density models that only sample.'],
          ],
        },
        {
          title: 'Maximum likelihood and the model families',
          description: 'Fitting a generative model by maximising log-likelihood of training data, why intractable likelihoods force lower bounds (VAEs) or adversarial proxies (GANs), and a map of autoregressive, VAE, GAN, flow and diffusion models.',
          concepts: ['Maximum likelihood objective', 'Intractable likelihoods and bounds', 'Family map: AR, VAE, GAN, flow, diffusion', 'Choosing a family for a modality'],
          quiz: [
            ['Why can a VAE not maximise likelihood directly?', 'The marginal p(x) integrates over latents and is intractable, so it maximises the ELBO.'],
            ['Which family dominates image generation today?', 'Diffusion and flow-matching models.'],
          ],
          prereqs: ['What generative models learn'],
        },
        {
          title: 'Latent variables and the manifold view',
          description: 'Real data lies near a low-dimensional manifold; latent variable models map a simple noise distribution onto it, and interpolation or arithmetic in latent space is what makes generation controllable.',
          concepts: ['Manifold hypothesis', 'Latent space as a coordinate system', 'Interpolation in latent space', 'Disentangled factors'],
          quiz: [
            ['What does interpolating between two latents produce?', 'A sequence of samples that morph smoothly from one output to the other.'],
            ['What does a disentangled latent give you?', 'Individual dimensions that control single factors like pose or colour.'],
          ],
          prereqs: ['Maximum likelihood and the model families'],
        },
        {
          title: 'Conditional generation',
          description: 'Steering output with a class label, text prompt, image or audio: concatenation, cross-attention and embedding injection as conditioning mechanisms, and why conditioning is what turns a model into a product.',
          concepts: ['Class-conditional generation', 'Text conditioning via cross-attention', 'Image and audio conditioning', 'Conditioning strength'],
          quiz: [
            ['How does a text prompt reach a diffusion U-Net?', 'Through cross-attention layers that attend over text encoder embeddings.'],
            ['What is unconditional generation used for in guided sampling?', 'As the baseline the guided prediction is pushed away from.'],
          ],
          prereqs: ['Latent variables and the manifold view'],
        },
      ],
    },
    {
      title: 'Autoregressive Models',
      description: 'Generate one piece at a time, conditioned on everything before.',
      topics: [
        {
          title: 'Autoregressive factorisation and teacher forcing',
          description: 'Writing p(x) as a product of conditionals p(x_t | x_<t), training every position in parallel with teacher forcing, and the exposure bias that appears when the model must feed on its own outputs.',
          concepts: ['Chain-rule factorisation', 'Parallel training with teacher forcing', 'Exposure bias', 'Sequential sampling cost'],
          quiz: [
            ['Why is autoregressive sampling slow?', 'Each new element requires a full forward pass conditioned on the previous ones.'],
            ['What is exposure bias?', 'Training on true prefixes but generating from its own imperfect prefixes.'],
          ],
          prereqs: ['Maximum likelihood and the model families'],
        },
        {
          title: 'Autoregressive image and audio models',
          description: 'PixelCNN generates pixels in raster order with masked convolutions, WaveNet generates audio samples with dilated causal convolutions, and VQ tokens let transformers generate images and audio as discrete sequences.',
          concepts: ['Masked convolutions in PixelCNN', 'Dilated causal convolutions in WaveNet', 'Discrete tokens for images and audio', 'Ordering choices for 2D data'],
          quiz: [
            ['What do WaveNet\'s dilations achieve?', 'A receptive field that grows exponentially with depth for long audio context.'],
            ['Why tokenise images before a transformer?', 'Attention over raw pixels is too expensive; a few hundred tokens are tractable.'],
          ],
          prereqs: ['Autoregressive factorisation and teacher forcing'],
        },
        {
          title: 'Transformers as autoregressive generators',
          description: 'Decoder-only transformers with causal masks are the dominant autoregressive model for text, code and increasingly images; how KV caching makes sampling affordable and how the same recipe extends to any tokenised modality.',
          concepts: ['Causal masking for generation', 'KV cache during sampling', 'Any-modality token streams', 'Scaling behaviour of AR transformers'],
          quiz: [
            ['What does the KV cache store?', 'Keys and values of past tokens so they are not recomputed each step.'],
            ['Can a text transformer generate images?', 'Yes, if images are tokenised into a discrete sequence first.'],
          ],
          prereqs: ['Autoregressive factorisation and teacher forcing'],
        },
      ],
    },
    {
      title: 'Variational Autoencoders',
      description: 'Learn a compressed latent, then sample from it.',
      topics: [
        {
          title: 'Autoencoders and the latent bottleneck',
          description: 'An encoder compresses input to a small code and a decoder reconstructs it; why a plain autoencoder learns a useful representation but its latent space has holes that make sampling produce garbage.',
          concepts: ['Encoder-decoder reconstruction', 'Bottleneck dimensionality', 'Holes in a deterministic latent space', 'Denoising autoencoders'],
          quiz: [
            ['Why does sampling random codes from a plain autoencoder fail?', 'Nothing forces the latent space to be continuous or cover the prior.'],
            ['What does a denoising autoencoder learn?', 'To reconstruct clean inputs from corrupted ones.'],
          ],
          prereqs: ['Latent variables and the manifold view'],
        },
        {
          title: 'The ELBO and reparameterisation trick',
          description: 'A VAE encodes to a distribution, trains with reconstruction plus a KL term to a standard normal prior, and uses the reparameterisation trick so gradients pass through sampling; the blurriness this objective produces.',
          concepts: ['Encoding to mean and variance', 'Reconstruction plus KL loss', 'Reparameterisation trick', 'Beta-VAE and the blur trade-off'],
          quiz: [
            ['Why reparameterise z = mu + sigma * eps?', 'So the sample is a differentiable function of the encoder outputs.'],
            ['What does the KL term push toward?', 'Latent codes that match the standard normal prior.'],
          ],
          prereqs: ['Autoencoders and the latent bottleneck'],
        },
        {
          title: 'VQ-VAE and discrete latents',
          description: 'Replacing continuous codes with a learned codebook via nearest-neighbour lookup and a straight-through gradient, which yields the discrete tokens used by DALL-E-style models and audio codecs.',
          concepts: ['Codebook and nearest-neighbour quantisation', 'Straight-through estimator', 'Commitment loss', 'Tokens for downstream generators'],
          quiz: [
            ['How do gradients pass the non-differentiable lookup?', 'The straight-through estimator copies decoder gradients to the encoder.'],
            ['What is codebook collapse?', 'Only a few codebook entries ever get used.'],
          ],
          prereqs: ['The ELBO and reparameterisation trick'],
        },
      ],
    },
    {
      title: 'Generative Adversarial Networks',
      description: 'A forger and a detective train each other.',
      topics: [
        {
          title: 'The adversarial game',
          description: 'A generator maps noise to samples and a discriminator learns to tell them from data; the minimax objective, the non-saturating generator loss, and alternating updates as a two-player game rather than a single loss.',
          concepts: ['Generator and discriminator roles', 'Minimax objective', 'Non-saturating generator loss', 'Alternating optimisation'],
          quiz: [
            ['What is the discriminator\'s ideal output at equilibrium?', '0.5 everywhere, since it cannot distinguish real from fake.'],
            ['Why use the non-saturating loss?', 'The original generator loss has vanishing gradients when the discriminator is confident.'],
          ],
          prereqs: ['Maximum likelihood and the model families'],
        },
        {
          title: 'Mode collapse and training instability',
          description: 'Why GANs oscillate, collapse to a few outputs or diverge, and the fixes that actually help: spectral normalisation, two-timescale learning rates, feature matching, and monitoring with sample grids and FID.',
          concepts: ['Mode collapse', 'Oscillation and non-convergence', 'Spectral normalisation', 'Two-timescale update rule', 'Diagnosing with sample grids'],
          quiz: [
            ['What is mode collapse?', 'The generator produces only a few distinct outputs regardless of noise.'],
            ['What does spectral normalisation constrain?', 'The Lipschitz constant of the discriminator by normalising each weight matrix.'],
          ],
          prereqs: ['The adversarial game'],
        },
        {
          title: 'Wasserstein GAN and gradient penalty',
          description: 'Replacing the JS divergence with the Wasserstein distance gives smoother gradients when distributions do not overlap; the critic, weight clipping versus gradient penalty, and the more meaningful loss curve.',
          concepts: ['Wasserstein distance intuition', 'Critic instead of discriminator', 'Gradient penalty', 'Interpreting WGAN loss curves'],
          quiz: [
            ['Why did WGAN-GP replace weight clipping?', 'Clipping limited capacity and caused exploding or vanishing gradients.'],
            ['What is the critic constrained to be?', '1-Lipschitz.'],
          ],
          prereqs: ['Mode collapse and training instability'],
        },
        {
          title: 'DCGAN, conditional GANs and StyleGAN',
          description: 'Architectural milestones: DCGAN\'s convolutional recipe, conditioning on labels or images (pix2pix, CycleGAN), and StyleGAN\'s mapping network and per-layer style injection that give controllable, photorealistic faces.',
          concepts: ['DCGAN architecture guidelines', 'Conditional GANs and pix2pix', 'CycleGAN unpaired translation', 'StyleGAN mapping network and styles'],
          quiz: [
            ['What does CycleGAN add for unpaired data?', 'A cycle-consistency loss so translating there and back recovers the input.'],
            ['What does StyleGAN\'s mapping network produce?', 'An intermediate latent w that controls styles at each layer.'],
          ],
          prereqs: ['The adversarial game'],
        },
      ],
    },
    {
      title: 'Diffusion Models',
      description: 'Learn to remove noise, then run it backwards.',
      topics: [
        {
          title: 'Forward noising and reverse denoising',
          description: 'A fixed forward process adds Gaussian noise over T steps until the image is pure noise; the model learns the reverse step, and the noise schedule determines how fast information is destroyed.',
          concepts: ['Forward diffusion process', 'Noise schedules: linear and cosine', 'Reverse denoising step', 'Closed-form sampling of x_t'],
          quiz: [
            ['Why can x_t be sampled directly from x_0?', 'Gaussian noise composes, giving a closed-form q(x_t | x_0).'],
            ['What happens at the final forward step?', 'The image is indistinguishable from standard normal noise.'],
          ],
          prereqs: ['Maximum likelihood and the model families'],
        },
        {
          title: 'DDPM training objective',
          description: 'Training reduces to predicting the noise that was added at a random timestep with a simple MSE, the U-Net backbone with timestep embeddings, and the equivalence between noise, x_0 and v prediction targets.',
          concepts: ['Noise prediction with MSE', 'Timestep embeddings', 'U-Net backbone for diffusion', 'Epsilon, x0 and v-prediction targets'],
          quiz: [
            ['What does the DDPM network predict?', 'The noise epsilon that was added to produce x_t.'],
            ['Why sample a random timestep per training example?', 'It trains the model to denoise at every noise level in expectation.'],
          ],
          prereqs: ['Forward noising and reverse denoising'],
        },
        {
          title: 'Samplers and fewer steps',
          description: 'DDPM needs hundreds of steps; DDIM, DPM-Solver and Euler samplers treat sampling as ODE solving and cut it to tens, while consistency and distillation methods reach a handful; the quality-speed trade-off.',
          concepts: ['DDIM deterministic sampling', 'ODE solvers: DPM-Solver and Euler', 'Step count versus quality', 'Distillation to few steps'],
          quiz: [
            ['What does DDIM change compared to DDPM sampling?', 'It uses a deterministic non-Markovian update that allows skipping steps.'],
            ['What do consistency models learn?', 'To map any noisy point directly to the clean sample in one step.'],
          ],
          prereqs: ['DDPM training objective'],
        },
        {
          title: 'Latent diffusion and Stable Diffusion',
          description: 'Running diffusion in the compressed latent space of a pretrained VAE makes high-resolution generation affordable; the text encoder, U-Net or DiT denoiser and VAE decoder that make up Stable Diffusion.',
          concepts: ['Diffusion in VAE latent space', 'Text encoder, denoiser, VAE decoder', 'DiT: transformers as denoisers', 'Resolution and compute trade-offs'],
          quiz: [
            ['Why diffuse in latent space?', 'A 64x64 latent is far cheaper to denoise than a 512x512 image.'],
            ['Which text encoder did the original Stable Diffusion use?', 'The CLIP text encoder.'],
          ],
          prereqs: ['Samplers and fewer steps', 'The ELBO and reparameterisation trick'],
        },
        {
          title: 'Classifier-free guidance and conditioning',
          description: 'Training with the condition randomly dropped lets sampling extrapolate from the unconditional to the conditional prediction, trading diversity for prompt adherence; guidance scale, negative prompts and their artefacts.',
          concepts: ['Condition dropout in training', 'Guidance scale', 'Negative prompts', 'Over-guidance artefacts'],
          quiz: [
            ['What does a higher guidance scale do?', 'Increases prompt adherence at the cost of diversity and eventually saturation.'],
            ['How does a negative prompt work?', 'It replaces the unconditional branch, so sampling moves away from it.'],
          ],
          prereqs: ['Latent diffusion and Stable Diffusion', 'Conditional generation'],
        },
        {
          title: 'Flow matching and rectified flows',
          description: 'Learning a velocity field that transports noise to data along straight paths, which simplifies training and sampling relative to DDPM; the formulation behind recent image and video generators.',
          concepts: ['Velocity field regression', 'Straight-line interpolation paths', 'Relation to diffusion', 'Sampling with few Euler steps'],
          quiz: [
            ['What does a flow-matching model predict?', 'The velocity from a noisy interpolant toward the data.'],
            ['Why do straighter paths help?', 'Fewer solver steps are needed to follow them accurately.'],
          ],
          prereqs: ['Samplers and fewer steps'],
        },
      ],
    },
    {
      title: 'Text Generation with LLMs',
      description: 'Controlling what a language model writes.',
      topics: [
        {
          title: 'Generating text with LLMs',
          description: 'Calling hosted and open models for generation, the role of the prompt and system message, context limits, and where the deep material lives: track-llms for internals and track-prompt-engineering for prompting.',
          concepts: ['Hosted APIs and open models', 'Prompt and system message roles', 'Context length limits', 'Where to go deeper'],
          quiz: [
            ['What happens when a prompt exceeds the context window?', 'The request fails or the oldest content is truncated.'],
            ['What is a system message?', 'Instructions that set the model\'s behaviour before the user\'s turn.'],
          ],
          prereqs: ['Transformers as autoregressive generators'],
        },
        {
          title: 'Sampling: temperature, top-k and top-p',
          description: 'Temperature rescales logits before the softmax, top-k keeps the k most likely tokens, top-p keeps the smallest set whose probability exceeds p; how they interact and which settings suit code versus creative writing.',
          concepts: ['Temperature scaling of logits', 'Top-k truncation', 'Nucleus (top-p) truncation', 'Settings per use case', 'Min-p sampling'],
          quiz: [
            ['What does temperature 2 do to the distribution?', 'Flattens it, making unlikely tokens much more likely.'],
            ['Why prefer top-p over top-k?', 'It adapts the candidate count to how peaked the distribution is.'],
          ],
          prereqs: ['Generating text with LLMs'],
        },
        {
          title: 'Repetition, length and stop control',
          description: 'Frequency and presence penalties, repetition penalties, max tokens, stop sequences and logit bias as the knobs for keeping outputs on track, and why greedy decoding loops.',
          concepts: ['Frequency and presence penalties', 'Max tokens and stop sequences', 'Logit bias', 'Why greedy decoding repeats'],
          quiz: [
            ['What does a presence penalty do?', 'Penalises any token that has already appeared, regardless of count.'],
            ['How do you stop generation at the end of a JSON object?', 'Use a stop sequence or a structured output mode.'],
          ],
          prereqs: ['Sampling: temperature, top-k and top-p'],
        },
        {
          title: 'Constrained and structured generation',
          description: 'Forcing outputs to match a grammar or JSON schema by masking invalid tokens at each step, the libraries that do it (Outlines, guidance, provider JSON modes), and the cost in speed and quality.',
          concepts: ['Grammar-constrained decoding', 'JSON schema enforcement', 'Outlines and provider JSON modes', 'Constraint trade-offs'],
          quiz: [
            ['How does constrained decoding guarantee valid JSON?', 'It masks every token that would break the grammar before sampling.'],
            ['Can constraints hurt quality?', 'Yes, forcing tokens can push the model off its natural distribution.'],
          ],
          prereqs: ['Repetition, length and stop control'],
        },
      ],
    },
    {
      title: 'Image, Audio and Multimodal Generation',
      description: 'The pipelines people actually run.',
      topics: [
        {
          title: 'Text-to-image with the diffusers library',
          description: 'Loading a Stable Diffusion or FLUX pipeline, prompting, seeds, schedulers, resolution and guidance settings, memory tricks like attention slicing and fp16, and batching for throughput.',
          concepts: ['Loading pipelines from the Hub', 'Seeds and reproducibility', 'Scheduler selection', 'Memory optimisations', 'Prompt writing for images'],
          quiz: [
            ['How do you reproduce an image exactly?', 'Same model, prompt, seed, scheduler, steps and resolution.'],
            ['What does fp16 loading save?', 'Half the GPU memory with little visible quality loss.'],
          ],
          prereqs: ['Classifier-free guidance and conditioning'],
        },
        {
          title: 'Image editing: img2img, inpainting and ControlNet',
          description: 'Starting diffusion from a noised version of an existing image, masking regions to regenerate, and ControlNet or IP-Adapter to condition on edges, poses, depth or reference images for precise control.',
          concepts: ['img2img and denoising strength', 'Inpainting with masks', 'ControlNet conditioning', 'IP-Adapter image prompts'],
          quiz: [
            ['What does denoising strength 0.3 mean in img2img?', 'Only the last 30 percent of the noise schedule is run, keeping most of the input.'],
            ['What does a Canny ControlNet condition on?', 'An edge map extracted from a reference image.'],
          ],
          prereqs: ['Text-to-image with the diffusers library'],
        },
        {
          title: 'Speech synthesis and voice',
          description: 'Text-to-speech as text to mel-spectrogram (Tacotron, VITS, modern LLM-style TTS) plus a neural vocoder (HiFi-GAN), voice cloning from short samples, and the consent issues cloning raises.',
          concepts: ['Text to mel-spectrogram', 'Neural vocoders', 'Voice cloning from short samples', 'Prosody and naturalness'],
          quiz: [
            ['What does a vocoder do?', 'Converts a spectrogram into a waveform.'],
            ['Why is voice cloning sensitive?', 'It enables impersonation without the speaker\'s consent.'],
          ],
          prereqs: ['Autoregressive image and audio models'],
        },
        {
          title: 'Music and sound generation',
          description: 'Generating audio from text with token-based models (MusicGen, AudioLM) and diffusion (AudioLDM), neural audio codecs like EnCodec as the tokeniser, and conditioning on melody or reference clips.',
          concepts: ['Neural audio codecs', 'Token-based music models', 'Diffusion for audio', 'Melody and reference conditioning'],
          quiz: [
            ['What does EnCodec produce?', 'Discrete audio tokens at several codebook levels.'],
            ['Why generate audio as tokens?', 'Language-model machinery handles long discrete sequences well.'],
          ],
          prereqs: ['VQ-VAE and discrete latents'],
        },
        {
          title: 'Video generation',
          description: 'Extending diffusion with temporal attention or 3D patches so frames stay consistent, the compute that makes it expensive, and the current pattern of latent video diffusion with text and image conditioning.',
          concepts: ['Temporal attention layers', 'Spatio-temporal latents', 'Image-to-video conditioning', 'Consistency and flicker'],
          quiz: [
            ['What breaks when frames are generated independently?', 'Temporal consistency: objects flicker and drift.'],
            ['Why is video so much more expensive than images?', 'Each clip is dozens of frames and attention spans time as well as space.'],
          ],
          prereqs: ['Latent diffusion and Stable Diffusion'],
        },
        {
          title: 'Multimodal models',
          description: 'Models that take and produce several modalities: vision-language models for image understanding, unified token models that emit text and image tokens, and speech-to-speech systems; how they are trained and wired.',
          concepts: ['Vision-language understanding', 'Unified any-to-any token models', 'Speech-to-speech models', 'Modality encoders and projectors'],
          quiz: [
            ['How does an image enter a language model?', 'A vision encoder produces embeddings that a projector maps into the token space.'],
            ['What is an any-to-any model?', 'One that can accept and generate multiple modalities as token streams.'],
          ],
          prereqs: ['Transformers as autoregressive generators'],
        },
      ],
    },
    {
      title: 'Fine-tuning and Customisation',
      description: 'Making a general model yours.',
      topics: [
        {
          title: 'Full fine-tuning versus parameter-efficient methods',
          description: 'Updating all weights needs memory for gradients and optimiser states several times the model size; adapters, prompt tuning and LoRA train a sliver of parameters instead, and when each is the right call.',
          concepts: ['Memory cost of full fine-tuning', 'Adapters and prompt tuning', 'When full fine-tuning wins', 'Catastrophic forgetting'],
          quiz: [
            ['Roughly how much memory does Adam add per parameter?', 'Two extra states, so about three times the weights with gradients.'],
            ['What is catastrophic forgetting?', 'Fine-tuning erodes capabilities the base model had.'],
          ],
          prereqs: ['Transformers as autoregressive generators'],
        },
        {
          title: 'LoRA mechanics',
          description: 'Freezing the base weights and learning a low-rank update W + BA on chosen matrices, the rank and alpha hyperparameters, which layers to target, and merging the update into the weights for zero-cost inference.',
          concepts: ['Low-rank update W + BA', 'Rank and alpha', 'Target modules', 'Merging and swapping adapters'],
          quiz: [
            ['Why are LoRA updates cheap to store?', 'Two small matrices of rank r replace a full-size weight delta.'],
            ['What does alpha control?', 'The scaling of the LoRA update relative to the rank.'],
          ],
          prereqs: ['Full fine-tuning versus parameter-efficient methods'],
        },
        {
          title: 'PEFT and QLoRA in practice',
          description: 'Using the peft library with transformers, QLoRA to fine-tune a 4-bit quantised base on one GPU, dataset formatting for instruction data, and checking that the adapter actually changed behaviour.',
          concepts: ['peft configuration', 'QLoRA and 4-bit bases', 'Formatting instruction datasets', 'Before-and-after evaluation'],
          quiz: [
            ['What does QLoRA quantise?', 'The frozen base weights to 4-bit, while LoRA adapters train in higher precision.'],
            ['Why keep a held-out prompt set?', 'To confirm the adapter improved the target behaviour without breaking others.'],
          ],
          prereqs: ['LoRA mechanics'],
        },
        {
          title: 'Customising diffusion models',
          description: 'Teaching a diffusion model a subject or style with DreamBooth, textual inversion and LoRA on the U-Net, the handful of images each needs, regularisation images to avoid overfitting, and evaluating the result.',
          concepts: ['DreamBooth subject training', 'Textual inversion tokens', 'LoRA for diffusion', 'Regularisation images'],
          quiz: [
            ['What does textual inversion learn?', 'A new token embedding, leaving the model weights unchanged.'],
            ['Why use regularisation images in DreamBooth?', 'To stop the class word from collapsing onto the training subject.'],
          ],
          prereqs: ['LoRA mechanics', 'Text-to-image with the diffusers library'],
        },
        {
          title: 'Instruction tuning and preference alignment overview',
          description: 'Supervised fine-tuning on instruction-response pairs, then preference optimisation with RLHF or DPO so outputs match human judgements; the shape of the pipeline, with full depth in track-llms.',
          concepts: ['Supervised instruction tuning', 'Preference data collection', 'RLHF and DPO in outline', 'Reward hacking'],
          quiz: [
            ['What does DPO remove from the RLHF pipeline?', 'The separate reward model and reinforcement learning loop.'],
            ['What is reward hacking?', 'Exploiting flaws in the reward signal without actually improving.'],
          ],
          prereqs: ['PEFT and QLoRA in practice'],
        },
      ],
    },
    {
      title: 'Evaluating Generated Content',
      description: 'Deciding whether output is good when there is no single right answer.',
      topics: [
        {
          title: 'Likelihood-based metrics',
          description: 'Perplexity and negative log-likelihood for autoregressive models, bits per dimension for images, why they are comparable only under the same tokeniser, and why better likelihood does not guarantee better samples.',
          concepts: ['Perplexity and NLL', 'Bits per dimension', 'Tokeniser dependence', 'Likelihood versus sample quality'],
          quiz: [
            ['Can two models with different tokenisers be compared by perplexity?', 'Not directly; normalise per byte or character.'],
            ['Does lower perplexity mean better generations?', 'Not necessarily; it measures fit, not sample quality.'],
          ],
          prereqs: ['Autoregressive factorisation and teacher forcing'],
        },
        {
          title: 'FID, Inception Score and CLIP score',
          description: 'Comparing feature statistics of generated and real images with Frechet Inception Distance, the Inception Score\'s confidence-plus-diversity idea, CLIP score for prompt alignment, and the sample sizes these need.',
          concepts: ['Frechet Inception Distance', 'Inception Score', 'CLIP score for text alignment', 'Sample size and variance'],
          quiz: [
            ['What does FID compare?', 'Gaussian fits of Inception features for real and generated images.'],
            ['Why is FID unreliable with few samples?', 'Covariance estimates are biased and noisy below thousands of images.'],
          ],
          prereqs: ['Latent diffusion and Stable Diffusion'],
        },
        {
          title: 'Human evaluation and preference studies',
          description: 'Pairwise comparisons, Likert rubrics and Elo-style leaderboards, controlling for position bias and annotator variance, and calculating how many judgements a reliable comparison needs.',
          concepts: ['Pairwise preference collection', 'Rubric design', 'Elo and Bradley-Terry ranking', 'Position bias and agreement'],
          quiz: [
            ['Why randomise the order of the two samples?', 'Raters systematically favour one position otherwise.'],
            ['What does a Bradley-Terry model estimate?', 'Latent strengths from pairwise win rates.'],
          ],
          prereqs: ['FID, Inception Score and CLIP score'],
        },
        {
          title: 'LLM-as-judge and automatic rubrics',
          description: 'Using a strong model to grade outputs against a rubric or reference, the known biases (verbosity, self-preference), calibrating judges against human labels, and pairwise judging with swapped order.',
          concepts: ['Rubric-based grading prompts', 'Judge biases', 'Calibrating against human labels', 'Swapped-order pairwise judging'],
          quiz: [
            ['What is verbosity bias?', 'Judges rate longer answers higher regardless of quality.'],
            ['How do you validate an LLM judge?', 'Measure its agreement with human labels on a sample.'],
          ],
          prereqs: ['Human evaluation and preference studies'],
        },
      ],
    },
    {
      title: 'Responsible Generation',
      description: 'The obligations that come with the ability to generate anything.',
      topics: [
        {
          title: 'Safety filters and content moderation',
          description: 'Input and output classifiers, safety checkers on image pipelines, prompt-level refusals and the trade-off between over-blocking and harm; building a layered approach rather than trusting one filter.',
          concepts: ['Input and output classifiers', 'Image safety checkers', 'Layered moderation', 'False positive and false negative costs'],
          quiz: [
            ['Why layer several checks?', 'No single classifier catches everything; layers cover each other\'s gaps.'],
            ['What is the cost of over-blocking?', 'Legitimate users are refused and trust the product less.'],
          ],
        },
        {
          title: 'Watermarking and provenance',
          description: 'Marking generated content statistically (token-level watermarks, SynthID) or with signed metadata (C2PA content credentials), how detection works, and what can and cannot survive editing.',
          concepts: ['Statistical token watermarks', 'Image watermarks such as SynthID', 'C2PA content credentials', 'Robustness to edits'],
          quiz: [
            ['How does a token watermark work?', 'Sampling is biased toward a secret green list of tokens that a detector can test for.'],
            ['Does cropping remove a C2PA credential?', 'It can, since the metadata is attached to the file rather than the pixels.'],
          ],
          prereqs: ['Safety filters and content moderation'],
        },
        {
          title: 'Licensing, copyright and training data',
          description: 'Model licences (open weights, non-commercial, Llama-style terms), dataset licences and opt-outs, memorisation and regurgitation risks, and what ownership of generated output means in practice.',
          concepts: ['Model and weight licences', 'Training data provenance', 'Memorisation and regurgitation', 'Ownership of generated output'],
          quiz: [
            ['Why does memorisation matter legally?', 'A model can reproduce copyrighted training data verbatim.'],
            ['What should you check before shipping an open model?', 'Its licence terms for commercial use and attribution.'],
          ],
        },
        {
          title: 'Bias, hallucination and misuse',
          description: 'Demographic and stylistic bias in generations, confident fabrications in text, deepfakes and disinformation, and the mitigations available: prompt design, grounding, red-teaming and usage policies.',
          concepts: ['Measuring bias in outputs', 'Hallucination and grounding', 'Deepfake and disinformation risks', 'Red-teaming generative systems'],
          quiz: [
            ['What is grounding?', 'Tying generation to provided sources so claims can be checked.'],
            ['What does red-teaming produce?', 'A catalogue of failure modes found by adversarial probing.'],
          ],
          prereqs: ['Safety filters and content moderation'],
        },
      ],
    },
    {
      title: 'Building Generative Applications',
      description: 'Turning a model call into something people use.',
      topics: [
        {
          title: 'Architecture of a generative app',
          description: 'A request path of API, queue and GPU worker, why generation is asynchronous, idempotent job ids, storing outputs in object storage and the difference between hosted APIs and self-hosted models.',
          concepts: ['API, queue and worker pattern', 'Asynchronous jobs and polling', 'Output storage', 'Hosted versus self-hosted'],
          quiz: [
            ['Why put a queue in front of GPU workers?', 'Generation takes seconds; the API must not block and load must be smoothed.'],
            ['Why idempotent job ids?', 'Retries must not create duplicate expensive generations.'],
          ],
          prereqs: ['Text-to-image with the diffusers library', 'Generating text with LLMs'],
        },
        {
          title: 'Streaming generation to the user',
          description: 'Token streaming with server-sent events or WebSockets, progressive image previews from intermediate diffusion steps, and handling cancellation and partial failures gracefully.',
          concepts: ['Server-sent events for tokens', 'Progressive previews', 'Cancellation handling', 'Partial failure UX'],
          quiz: [
            ['Why stream tokens?', 'Perceived latency drops because the user reads while the model generates.'],
            ['How can a diffusion app show progress?', 'Decode intermediate latents every few steps as previews.'],
          ],
          prereqs: ['Architecture of a generative app'],
        },
        {
          title: 'Cost, caching and rate limits',
          description: 'Token and GPU-second economics, caching identical requests and prompt prefixes, batching diffusion jobs, tiered model routing, and enforcing per-user limits before the bill arrives.',
          concepts: ['Cost per generation', 'Response and prefix caching', 'Batching GPU jobs', 'Model routing by need', 'Per-user quotas'],
          quiz: [
            ['What is the cheapest generation?', 'The one served from cache.'],
            ['Why route easy requests to a smaller model?', 'It cuts cost and latency without hurting quality where it is not needed.'],
          ],
          prereqs: ['Architecture of a generative app'],
        },
        {
          title: 'Observability and feedback loops',
          description: 'Logging prompts, parameters and outputs with ids, capturing thumbs-up and edits as signals, dashboards for latency and refusals, and using the logs to build eval sets and fine-tuning data.',
          concepts: ['Structured generation logs', 'User feedback capture', 'Latency and refusal dashboards', 'Logs to eval sets'],
          quiz: [
            ['What should every generation log include?', 'Prompt, parameters, model version, output and a request id.'],
            ['How do logs become training data?', 'Positively rated or corrected outputs are curated into fine-tuning sets.'],
          ],
          prereqs: ['Streaming generation to the user'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: train a VAE and a GAN on Fashion-MNIST',
          description: 'Implement a convolutional VAE and a DCGAN in PyTorch on the same dataset, visualise latent interpolations and sample grids over training, compute FID for both, and write up why the samples differ.',
          concepts: ['Implement and train the VAE', 'Implement and train the DCGAN', 'Compare samples and FID', 'Explore the latent space'],
          quiz: [
            ['Which model will give blurrier samples?', 'The VAE, because of its reconstruction objective.'],
            ['What is the first sign of GAN training failure?', 'Sample grids that all look alike, indicating mode collapse.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: style LoRA for Stable Diffusion',
          description: 'Collect 20 to 50 images of a consistent style, train a LoRA on the U-Net with diffusers, compare guidance scales and ranks, generate a gallery with fixed seeds, and document the licence and consent for the images.',
          concepts: ['Curate and caption the images', 'Train the LoRA', 'Sweep rank and guidance', 'Publish a seeded gallery'],
          quiz: [
            ['Why fix seeds when comparing settings?', 'So differences come from the setting, not the noise.'],
            ['What indicates the LoRA overfit?', 'Outputs reproduce training images instead of the style.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: streaming writing assistant',
          description: 'Build a web app that streams LLM output with exposed temperature, top-p and length controls, a stop button, a system-prompt editor and logging of every generation with feedback buttons.',
          concepts: ['Streaming backend', 'Sampling controls in the UI', 'Cancellation and stop sequences', 'Log and collect feedback'],
          quiz: [
            ['What should happen when the user hits stop?', 'The server cancels the generation and the partial text is kept.'],
            ['Why expose top-p rather than only temperature?', 'It gives users a second, more stable way to trade creativity for reliability.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: narrated summaries pipeline',
          description: 'Summarise articles with an LLM, synthesise speech with an open TTS model, stitch audio with intros, evaluate summaries with an LLM judge and a small human study, and publish an RSS-style feed of results.',
          concepts: ['Summarise with structured prompts', 'Synthesise and stitch audio', 'Evaluate with a judge and humans', 'Publish the feed'],
          quiz: [
            ['What should the judge check besides fluency?', 'Faithfulness to the source article.'],
            ['Why add a human study?', 'To calibrate the automatic judge on this content.'],
          ],
          style: 'project',
        },
        {
          title: 'Generative AI interview questions',
          description: 'Why VAEs blur and GANs collapse, what a diffusion model predicts, how classifier-free guidance works, LoRA versus full fine-tuning, FID limits, temperature versus top-p, and how you would watermark output.',
          concepts: ['Model family comparison questions', 'Diffusion and sampling questions', 'Fine-tuning and evaluation questions', 'Responsible AI questions'],
          quiz: [
            ['Explain the diffusion training objective in one sentence.', 'Predict the noise added at a random timestep and minimise MSE.'],
            ['When would you pick a GAN over diffusion today?', 'When single-step, real-time generation matters more than sample diversity.'],
          ],
          style: 'reading',
        },
        {
          title: 'Whiteboard derivations',
          description: 'Derive the ELBO from Jensen\'s inequality, write the GAN minimax objective and its optimal discriminator, derive the closed-form q(x_t | x_0), and sketch a sampling loop with temperature and top-p in NumPy.',
          concepts: ['Derive the ELBO', 'Optimal discriminator derivation', 'Closed-form forward diffusion', 'Sampling loop in NumPy'],
          quiz: [
            ['What is the optimal discriminator D*(x)?', 'p_data(x) / (p_data(x) + p_g(x)).'],
            ['Which inequality gives the ELBO?', 'Jensen\'s inequality applied to the log of an expectation.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
