import { defineTrack } from '../define'

export const deepLearning = defineTrack({
  id: 'track-deep-learning',
  title: 'Deep Learning',
  description: 'Neural networks from the perceptron to the transformer: activations, losses, backpropagation, optimisers and regularisation, PyTorch end to end with a Keras overview, CNNs, RNNs, attention, embeddings, transfer learning and fine-tuning, debugging training runs, GPUs, mixed precision and the basics of distributed training.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '🧬',
  tags: ['deep learning', 'pytorch', 'neural networks', 'cnn', 'transformers', 'fine-tuning', 'gpu'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-machine-learning'],
  style: 'practice',
  categories: [
    {
      title: 'Neural Network Foundations',
      description: 'What a network computes and how it learns.',
      topics: [
        {
          title: 'Perceptrons, layers and the multilayer network',
          description: 'A neuron computes a weighted sum plus bias through a nonlinearity; stacking layers of them builds functions that approximate almost anything. Understanding a layer as a matrix multiply plus activation makes every architecture readable.',
          concepts: ['Weighted sum, bias and activation', 'Layers as matrix multiplications', 'Width, depth and capacity', 'Universal approximation intuition'],
          quiz: [
            ['What can a single-layer perceptron not learn?', 'XOR, or any function that is not linearly separable.'],
            ['How many parameters does a dense layer from 100 to 50 units have?', '100 × 50 weights plus 50 biases = 5,050.'],
          ],
        },
        {
          title: 'Activation functions',
          description: 'Sigmoid and tanh saturate and shrink gradients; ReLU is cheap and keeps gradients alive but can die; GELU and SiLU smooth it for transformers. The choice affects training stability more than most hyperparameters.',
          concepts: ['Sigmoid and tanh saturation', 'ReLU and dying units', 'Leaky ReLU, GELU and SiLU', 'Output activations by task'],
          quiz: [
            ['Why did ReLU replace sigmoid in hidden layers?', 'Its gradient is 1 for positive inputs, so deep networks train without vanishing gradients.'],
            ['Which activation belongs on a multi-class output layer?', 'Softmax, usually folded into the cross-entropy loss.'],
          ],
          prereqs: ['Perceptrons, layers and the multilayer network'],
        },
        {
          title: 'Loss functions',
          description: 'Mean squared error for regression, cross-entropy for classification, binary cross-entropy with logits for multi-label, and Huber for robustness. Matching the loss to the output type and using the numerically stable logits versions avoids silent failure.',
          concepts: ['MSE and Huber for regression', 'Cross-entropy from logits', 'BCEWithLogits for multi-label', 'Class weights inside the loss'],
          quiz: [
            ['Why use CrossEntropyLoss on raw logits rather than after softmax?', 'It computes log-softmax internally in a numerically stable way.'],
            ['Which loss for predicting several independent tags per image?', 'BCEWithLogitsLoss.'],
          ],
          prereqs: ['Activation functions'],
        },
        {
          title: 'Forward pass and computational graphs',
          description: 'A forward pass composes layer operations into a graph whose nodes are tensors and edges are operations; autograd records it to differentiate later. Seeing the graph explains memory use and why intermediate activations are kept.',
          concepts: ['Composing operations into a graph', 'Activations stored for backward', 'Batch dimension conventions', 'Reading shapes through the graph'],
          quiz: [
            ['Why does training use more memory than inference?', 'Intermediate activations are stored for the backward pass.'],
            ['What shape does a batch of 32 RGB 224×224 images have in PyTorch?', '(32, 3, 224, 224).'],
          ],
          prereqs: ['Loss functions'],
        },
        {
          title: 'Backpropagation',
          description: 'Backpropagation applies the chain rule from the loss backwards through the graph, reusing each layer\'s gradient for the one before it. Implementing it by hand for a two-layer network in numpy demystifies autograd forever.',
          concepts: ['Chain rule through layers', 'Gradients of a dense layer', 'Vanishing and exploding gradients', 'A numpy implementation'],
          quiz: [
            ['What is the gradient of the loss with respect to a dense layer\'s weights?', 'The input transposed times the gradient at the output, xᵀ·δ.'],
            ['Why do gradients vanish in deep sigmoid networks?', 'Each layer multiplies by a derivative at most 0.25, shrinking the signal exponentially.'],
          ],
          prereqs: ['Forward pass and computational graphs'],
        },
      ],
    },
    {
      title: 'Optimisation and Regularisation',
      description: 'Making the loss go down and the model generalise.',
      topics: [
        {
          title: 'SGD and mini-batch training',
          description: 'Training updates weights from gradient estimates on mini-batches, trading noise for speed. Batch size, shuffling and the number of epochs interact with the learning rate and decide both convergence and generalisation.',
          concepts: ['Mini-batch gradient estimates', 'Batch size effects', 'Epochs, steps and shuffling', 'Gradient clipping'],
          quiz: [
            ['What does doubling the batch size do to the number of steps per epoch?', 'Halves it.'],
            ['Why clip gradients?', 'To stop exploding gradients from producing huge, destabilising updates.'],
          ],
          prereqs: ['Backpropagation'],
        },
        {
          title: 'Momentum, Adam and AdamW',
          description: 'Momentum smooths updates, Adam adapts step sizes per parameter, and AdamW decouples weight decay so it acts as true regularisation. AdamW with a tuned learning rate is the default for most modern networks.',
          concepts: ['Momentum and Nesterov', 'Adam moments and epsilon', 'AdamW decoupled weight decay', 'Choosing optimiser defaults'],
          quiz: [
            ['What is the difference between Adam with L2 and AdamW?', 'AdamW applies weight decay directly to weights instead of through the adaptive gradient.'],
            ['What are typical Adam betas?', '0.9 and 0.999.'],
          ],
          prereqs: ['SGD and mini-batch training'],
        },
        {
          title: 'Learning-rate schedules and warm-up',
          description: 'Warm-up avoids early instability, cosine or step decay refines late training, and one-cycle policies squeeze more from a fixed budget. A learning-rate range test picks the starting value in minutes.',
          concepts: ['Learning-rate range test', 'Cosine and step decay', 'Warm-up', 'OneCycle and ReduceLROnPlateau'],
          quiz: [
            ['What does ReduceLROnPlateau do?', 'Cuts the learning rate when a monitored metric stops improving.'],
            ['Why is warm-up important for transformers?', 'Adam\'s early variance estimates are unreliable and large steps destabilise attention.'],
          ],
          prereqs: ['Momentum, Adam and AdamW'],
        },
        {
          title: 'Weight initialisation',
          description: 'Initial weights must keep activations and gradients at a sensible scale through the depth; Xavier and Kaiming initialisation set the variance from fan-in and the activation. Bad initialisation shows up as loss stuck at the start.',
          concepts: ['Why zeros fail', 'Xavier (Glorot) initialisation', 'Kaiming (He) initialisation for ReLU', 'PyTorch defaults'],
          quiz: [
            ['Why not initialise all weights to zero?', 'Every unit gets the same gradient and they never differentiate.'],
            ['Which initialisation pairs with ReLU?', 'Kaiming (He) initialisation.'],
          ],
          prereqs: ['Backpropagation'],
        },
        {
          title: 'Dropout and weight decay',
          description: 'Dropout randomly zeroes activations during training to prevent co-adaptation; weight decay penalises large weights. Both reduce overfitting, and both must be switched off or accounted for at inference.',
          concepts: ['Dropout mechanics and scaling', 'Dropout rate choices', 'Weight decay as L2', 'Train versus eval behaviour'],
          quiz: [
            ['What does model.eval() do to dropout?', 'Disables it so all units are active.'],
            ['Why scale activations during dropout training?', 'To keep the expected activation the same at inference without rescaling.'],
          ],
          prereqs: ['SGD and mini-batch training'],
        },
        {
          title: 'Batch and layer normalisation',
          description: 'Batch norm normalises each feature across the batch and lets deeper networks train faster; layer norm normalises across features per example and suits sequences and transformers. Their train and eval behaviour differ.',
          concepts: ['BatchNorm statistics and running averages', 'LayerNorm per example', 'Where to place normalisation', 'Small-batch problems with BatchNorm'],
          quiz: [
            ['Why is BatchNorm problematic with batch size 2?', 'Batch statistics are too noisy to normalise reliably.'],
            ['Which normalisation do transformers use?', 'LayerNorm (or RMSNorm).'],
          ],
          prereqs: ['Dropout and weight decay'],
        },
      ],
    },
    {
      title: 'PyTorch End to End',
      description: 'The framework used for most research and much of production.',
      topics: [
        {
          title: 'Tensors, devices and memory layout',
          description: 'Tensors carry dtype, device and strides; moving to CUDA, keeping shapes explicit and knowing when view fails because memory is not contiguous prevents most beginner errors.',
          concepts: ['Tensor creation and dtypes', 'CPU to GPU transfers', 'Contiguity, view and reshape', 'In-place operations'],
          quiz: [
            ['When does tensor.view fail?', 'When the tensor is not contiguous in memory; use reshape or .contiguous().'],
            ['What does an underscore suffix such as add_ mean?', 'An in-place operation.'],
          ],
        },
        {
          title: 'Autograd in depth',
          description: 'requires_grad, the dynamic graph, backward, gradient accumulation, detach and no_grad are the mechanics; custom autograd Functions and hooks handle the rare special cases. Understanding retain_graph avoids cryptic errors.',
          concepts: ['Dynamic graph creation', 'Gradient accumulation and zero_grad', 'detach and no_grad', 'Hooks and custom Functions'],
          quiz: [
            ['Why does calling backward twice raise an error?', 'The graph is freed after the first call unless retain_graph=True.'],
            ['What does tensor.detach() return?', 'A tensor sharing data but cut from the graph.'],
          ],
          prereqs: ['Tensors, devices and memory layout'],
        },
        {
          title: 'Building models with nn.Module',
          description: 'Declare layers in __init__, compute in forward, and compose modules into blocks; parameters, buffers and submodules are tracked automatically. ModuleList and ModuleDict keep dynamic architectures registered.',
          concepts: ['__init__ and forward', 'Parameters versus buffers', 'ModuleList and ModuleDict', 'Composing reusable blocks'],
          quiz: [
            ['Why use nn.ModuleList instead of a Python list of layers?', 'So the layers are registered and their parameters are found by the optimiser.'],
            ['What is a buffer?', 'A tensor saved with the model but not trained, such as BatchNorm running mean.'],
          ],
          prereqs: ['Autograd in depth'],
        },
        {
          title: 'Datasets, DataLoader and transforms',
          description: 'A Dataset returns one example, transforms augment it, and the DataLoader batches with workers and pinned memory. Data loading is the usual GPU-utilisation bottleneck, so it deserves profiling.',
          concepts: ['Map-style and iterable datasets', 'torchvision transforms', 'Workers, prefetching and pin_memory', 'Custom collate for variable sizes'],
          quiz: [
            ['What does pin_memory=True speed up?', 'Host-to-GPU transfers.'],
            ['When do you need a custom collate_fn?', 'When examples have different sizes, such as variable-length sequences.'],
          ],
          prereqs: ['Tensors, devices and memory layout'],
        },
        {
          title: 'The training loop and evaluation',
          description: 'Forward, loss, backward, step, zero_grad, with model.train() and model.eval() switching modes and torch.no_grad() around evaluation. Adding metric tracking, logging and validation each epoch makes it a real trainer.',
          concepts: ['The core loop', 'Train and eval modes', 'Metrics with torchmetrics', 'Validation each epoch'],
          quiz: [
            ['What is the order of loss.backward(), optimizer.step() and optimizer.zero_grad()?', 'backward, step, then zero_grad (or zero_grad first each iteration).'],
            ['Why wrap validation in torch.no_grad()?', 'To skip graph building and save memory and time.'],
          ],
          prereqs: ['Building models with nn.Module', 'Datasets, DataLoader and transforms'],
        },
        {
          title: 'Checkpointing and resuming',
          description: 'Save model and optimiser state_dicts plus epoch and scheduler state so training can resume exactly; keep the best checkpoint by validation metric. Loading a state_dict into a differently named architecture is a classic failure.',
          concepts: ['state_dict of model and optimiser', 'Best-checkpoint selection', 'Resuming with scheduler state', 'strict loading and key mismatches'],
          quiz: [
            ['Why save the optimiser state too?', 'Adam\'s moment estimates are needed to resume training faithfully.'],
            ['What does load_state_dict(strict=False) allow?', 'Loading with missing or unexpected keys, for partial transfer.'],
          ],
          prereqs: ['The training loop and evaluation'],
        },
        {
          title: 'torch.compile and performance basics',
          description: 'torch.compile fuses operations for speed, channels_last memory format helps convolutions, and the profiler shows whether the GPU is waiting on data. Small changes here often double throughput.',
          concepts: ['torch.compile', 'channels_last memory format', 'The PyTorch profiler', 'Finding data-loading bottlenecks'],
          quiz: [
            ['What does torch.compile do to a model?', 'Traces and compiles it into fused kernels for faster execution.'],
            ['What does low GPU utilisation usually indicate?', 'The data pipeline is the bottleneck.'],
          ],
          prereqs: ['The training loop and evaluation'],
        },
      ],
    },
    {
      title: 'TensorFlow and Keras Overview',
      description: 'Enough to read, run and port code from the other major framework.',
      topics: [
        {
          title: 'Keras Sequential and Functional APIs',
          description: 'Keras builds models by stacking layers in Sequential or wiring tensors in the Functional API, with shapes inferred automatically. The abstractions map one to one onto PyTorch modules.',
          concepts: ['Sequential models', 'Functional API graphs', 'Layers and shape inference', 'Subclassing keras.Model'],
          quiz: [
            ['When do you need the Functional API over Sequential?', 'For multiple inputs, outputs or branches.'],
            ['What does model.summary() show?', 'Layers, output shapes and parameter counts.'],
          ],
        },
        {
          title: 'compile, fit and callbacks',
          description: 'compile attaches the optimiser, loss and metrics; fit runs the training loop with validation; callbacks such as EarlyStopping, ModelCheckpoint and TensorBoard hook into it. It is the batteries-included counterpart of a hand-written loop.',
          concepts: ['compile with loss and metrics', 'fit with validation data', 'EarlyStopping and ModelCheckpoint', 'tf.data pipelines'],
          quiz: [
            ['What does EarlyStopping(patience=3) do?', 'Stops training after three epochs without improvement on the monitored metric.'],
            ['What is the Keras equivalent of a DataLoader?', 'A tf.data.Dataset pipeline.'],
          ],
          prereqs: ['Keras Sequential and Functional APIs'],
        },
        {
          title: 'PyTorch versus TensorFlow in practice',
          description: 'PyTorch dominates research and most new production work; TensorFlow remains in mobile (TF Lite), some enterprise stacks and older codebases. Knowing the mapping of concepts lets you port a model in either direction and export via ONNX.',
          concepts: ['Ecosystem and adoption', 'Concept mapping between frameworks', 'Exporting with ONNX', 'Choosing for a project'],
          quiz: [
            ['What does ONNX provide?', 'A framework-neutral model format for inference runtimes.'],
            ['Which framework has the stronger mobile deployment story?', 'TensorFlow, via TF Lite, though PyTorch ExecuTorch is catching up.'],
          ],
          prereqs: ['compile, fit and callbacks'],
        },
      ],
    },
    {
      title: 'Convolutional Networks',
      description: 'Networks that see.',
      topics: [
        {
          title: 'The convolution operation',
          description: 'A convolution slides small learned filters over the input, sharing weights across positions to detect local patterns with few parameters. Output size follows from kernel size, stride and padding, which you must be able to compute.',
          concepts: ['Filters, channels and weight sharing', 'Stride and padding', 'Output size formula', 'Receptive field'],
          quiz: [
            ['What is the output size of a 32×32 input with a 3×3 kernel, stride 1, padding 1?', '32×32.'],
            ['How many parameters does a 3×3 conv from 64 to 128 channels have?', '3 × 3 × 64 × 128 + 128 = 73,856.'],
          ],
        },
        {
          title: 'Pooling, normalisation and conv blocks',
          description: 'Max and average pooling downsample, batch norm stabilises, and conv-norm-activation blocks are the repeating unit of every CNN. Global average pooling replaces flatten-and-dense at the head.',
          concepts: ['Max and average pooling', 'Conv-BN-ReLU blocks', 'Global average pooling', 'Downsampling strategies'],
          quiz: [
            ['What does global average pooling produce?', 'One value per channel, independent of input size.'],
            ['Why does stride-2 convolution sometimes replace pooling?', 'It learns the downsampling instead of fixing it.'],
          ],
          prereqs: ['The convolution operation'],
        },
        {
          title: 'Classic architectures: LeNet to ResNet',
          description: 'LeNet, AlexNet, VGG and ResNet trace the ideas that made CNNs work: depth, small kernels and skip connections that let gradients flow through a hundred layers. Reading these architectures teaches design patterns reused everywhere.',
          concepts: ['VGG and stacked 3×3 kernels', 'Residual connections', 'Bottleneck blocks', 'Efficient variants: MobileNet and EfficientNet'],
          quiz: [
            ['What problem do residual connections solve?', 'Degradation in very deep networks by letting layers learn residuals and gradients skip through.'],
            ['Why use two 3×3 convolutions instead of one 5×5?', 'Same receptive field with fewer parameters and an extra nonlinearity.'],
          ],
          prereqs: ['Pooling, normalisation and conv blocks'],
        },
        {
          title: 'Data augmentation for images',
          description: 'Random crops, flips, colour jitter, cutout and mixup expand the dataset with label-preserving variations and are often worth more accuracy than architecture changes. Augment training data only, and keep evaluation deterministic.',
          concepts: ['Geometric and colour augmentations', 'Cutout, mixup and CutMix', 'Augmentation strength versus dataset size', 'Test-time augmentation'],
          quiz: [
            ['Why not augment the validation set?', 'Metrics must reflect real, unmodified inputs.'],
            ['What does mixup do?', 'Blends two images and their labels with a random weight.'],
          ],
          prereqs: ['The convolution operation'],
        },
        {
          title: 'Beyond classification: detection and segmentation',
          description: 'Object detection predicts boxes and classes, semantic segmentation labels each pixel; both reuse CNN or transformer backbones with task-specific heads. Knowing the task shapes and losses lets you use torchvision and Ultralytics models sensibly.',
          concepts: ['Detection outputs and IoU', 'Segmentation masks and per-pixel loss', 'Backbones and heads', 'Pretrained detectors in torchvision'],
          quiz: [
            ['What metric evaluates a predicted bounding box?', 'Intersection over union with the ground-truth box.'],
            ['What does a U-Net add to a plain encoder?', 'A decoder with skip connections to recover full-resolution masks.'],
          ],
          prereqs: ['Classic architectures: LeNet to ResNet'],
        },
      ],
    },
    {
      title: 'Sequence Models',
      description: 'Networks that read in order.',
      topics: [
        {
          title: 'Recurrent neural networks',
          description: 'An RNN applies the same cell to each step, carrying a hidden state that summarises the past. Backpropagation through time trains it, and vanishing gradients over long sequences are its central weakness.',
          concepts: ['Hidden state recurrence', 'Backpropagation through time', 'Vanishing gradients over time', 'Padding and packing sequences'],
          quiz: [
            ['What does the hidden state represent?', 'A learned summary of the sequence so far.'],
            ['Why pack padded sequences in PyTorch?', 'So the RNN ignores padding steps and returns correct final states.'],
          ],
          prereqs: ['Backpropagation'],
        },
        {
          title: 'LSTMs and GRUs',
          description: 'Gated cells add paths that let information persist across many steps, fixing vanishing gradients for practical lengths. LSTMs have input, forget and output gates; GRUs simplify to two gates with similar results.',
          concepts: ['Forget, input and output gates', 'Cell state as a memory highway', 'GRU simplification', 'Bidirectional and stacked layers'],
          quiz: [
            ['What does the forget gate control?', 'How much of the previous cell state is kept.'],
            ['When is a bidirectional LSTM appropriate?', 'When the whole sequence is available at prediction time, such as tagging text.'],
          ],
          prereqs: ['Recurrent neural networks'],
        },
        {
          title: 'Sequence-to-sequence and teacher forcing',
          description: 'An encoder compresses the input sequence and a decoder generates the output step by step; teacher forcing feeds the true previous token during training. Exposure bias and decoding strategies follow from this set-up.',
          concepts: ['Encoder-decoder structure', 'Teacher forcing', 'Greedy and beam search decoding', 'Exposure bias'],
          quiz: [
            ['What is teacher forcing?', 'Feeding the ground-truth previous token to the decoder during training.'],
            ['What does beam search keep at each step?', 'The k most probable partial sequences.'],
          ],
          prereqs: ['LSTMs and GRUs'],
        },
        {
          title: 'The attention mechanism',
          description: 'Attention lets the decoder look at all encoder states weighted by relevance instead of one compressed vector, fixing the bottleneck of seq2seq. The query-key-value formulation is the bridge to transformers.',
          concepts: ['Alignment scores and softmax weights', 'Query, key and value', 'Additive versus dot-product attention', 'Attention as soft lookup'],
          quiz: [
            ['What problem did attention solve in seq2seq?', 'Compressing the whole input into a single fixed vector.'],
            ['What does the softmax over scores produce?', 'Weights that sum to 1 over the input positions.'],
          ],
          prereqs: ['Sequence-to-sequence and teacher forcing'],
        },
      ],
    },
    {
      title: 'Transformers and Embeddings',
      description: 'The architecture behind modern language, vision and multimodal models.',
      topics: [
        {
          title: 'Self-attention and multi-head attention',
          description: 'Each token builds queries, keys and values and attends to every other token; multiple heads let it attend to different relations at once. The scaled dot-product formula and its O(n²) cost explain both the power and the limits of transformers.',
          concepts: ['Scaled dot-product attention', 'Multiple heads and projections', 'Masking for causality and padding', 'Quadratic cost in sequence length'],
          quiz: [
            ['Why divide the scores by the square root of the key dimension?', 'To keep the softmax from saturating as dimensions grow.'],
            ['What does a causal mask do?', 'Prevents a position from attending to later positions.'],
          ],
          prereqs: ['The attention mechanism'],
        },
        {
          title: 'Positional encodings',
          description: 'Attention is order-blind, so positions are injected through sinusoidal signals, learned embeddings or rotary encodings. The choice affects how models generalise to longer sequences.',
          concepts: ['Why attention needs positions', 'Sinusoidal encodings', 'Learned positional embeddings', 'Rotary position embeddings'],
          quiz: [
            ['What happens if positional information is removed?', 'The model treats the input as a bag of tokens.'],
            ['Which encoding is used by most current large language models?', 'Rotary position embeddings (RoPE).'],
          ],
          prereqs: ['Self-attention and multi-head attention'],
        },
        {
          title: 'Transformer encoder and decoder blocks',
          description: 'A block is attention, a feed-forward network, residual connections and layer norm; encoders see the whole input, decoders generate causally. BERT, GPT and T5 are the three block arrangements to recognise.',
          concepts: ['Block anatomy: attention, MLP, residual, norm', 'Pre-norm versus post-norm', 'Encoder-only, decoder-only, encoder-decoder', 'Parameter count of a block'],
          quiz: [
            ['Which family is decoder-only?', 'GPT-style models.'],
            ['What does the feed-forward sublayer do?', 'Applies the same two-layer MLP to each position independently.'],
          ],
          prereqs: ['Positional encodings'],
        },
        {
          title: 'Tokenisation and embedding layers',
          description: 'Subword tokenisers such as BPE and WordPiece split text into a fixed vocabulary; an embedding layer maps ids to vectors that training shapes. Tokenisation decides sequence length, cost and how rare words are handled.',
          concepts: ['BPE and WordPiece', 'Vocabulary size trade-offs', 'nn.Embedding and padding index', 'Tied input and output embeddings'],
          quiz: [
            ['What does nn.Embedding(50000, 768) store?', 'A 50,000 by 768 lookup table of learned vectors.'],
            ['Why use subwords rather than whole words?', 'To handle rare and unseen words with a bounded vocabulary.'],
          ],
          prereqs: ['Transformer encoder and decoder blocks'],
        },
        {
          title: 'Pretrained transformers with Hugging Face',
          description: 'The transformers library loads tokenisers and models by name, and the Trainer or a plain loop fine-tunes them. Knowing AutoModel classes, model outputs and the datasets library is the practical entry point to modern NLP and vision.',
          concepts: ['AutoTokenizer and AutoModel', 'Model outputs and hidden states', 'datasets library and preprocessing', 'Trainer versus a custom loop'],
          quiz: [
            ['What does AutoModelForSequenceClassification add to a base model?', 'A classification head on top of the pooled output.'],
            ['How does the tokeniser return tensors for PyTorch?', 'tokenizer(text, return_tensors="pt", padding=True, truncation=True)'],
          ],
          prereqs: ['Tokenisation and embedding layers'],
        },
        {
          title: 'Embeddings for similarity and retrieval',
          description: 'Sentence and image encoders map inputs to vectors where cosine similarity reflects meaning, enabling search, clustering and retrieval-augmented generation. Pooling choices and normalisation determine quality; vector search is continued in track-embeddings.',
          concepts: ['Mean pooling and CLS pooling', 'Normalising vectors for cosine search', 'Contrastive training intuition', 'Nearest-neighbour search'],
          quiz: [
            ['Why normalise embeddings before a dot product?', 'So the dot product equals cosine similarity.'],
            ['What does contrastive training push apart?', 'Embeddings of unrelated pairs, while pulling related pairs together.'],
          ],
          prereqs: ['Pretrained transformers with Hugging Face'],
        },
      ],
    },
    {
      title: 'Transfer Learning and Fine-tuning',
      description: 'Reusing what someone else trained.',
      topics: [
        {
          title: 'Feature extraction versus fine-tuning',
          description: 'Freezing a pretrained backbone and training only a new head is fast and safe on small data; unfreezing and fine-tuning with a small learning rate gives more accuracy with more data. Choosing between them depends on data size and domain shift.',
          concepts: ['Freezing parameters', 'Training a new head', 'Gradual unfreezing', 'Data size and domain shift trade-off'],
          quiz: [
            ['How do you freeze a backbone in PyTorch?', 'Set requires_grad=False on its parameters.'],
            ['Why use a smaller learning rate when fine-tuning?', 'To avoid destroying pretrained features with large updates.'],
          ],
          prereqs: ['Checkpointing and resuming'],
        },
        {
          title: 'Fine-tuning a CNN for a new image task',
          description: 'Load a torchvision ResNet or EfficientNet with pretrained weights, replace the final layer, normalise inputs with the original statistics and train with discriminative learning rates. This recipe gets strong results from a few hundred images.',
          concepts: ['Loading pretrained torchvision weights', 'Replacing the classifier layer', 'Matching input preprocessing', 'Discriminative learning rates'],
          quiz: [
            ['Why must inputs use ImageNet mean and std?', 'The pretrained filters expect that input distribution.'],
            ['What are discriminative learning rates?', 'Lower rates for early layers, higher for the new head.'],
          ],
          prereqs: ['Feature extraction versus fine-tuning', 'Classic architectures: LeNet to ResNet'],
        },
        {
          title: 'Fine-tuning a transformer for classification',
          description: 'Tokenise, attach a classification head, train for a few epochs with warm-up and a small learning rate, and evaluate with the right metric. Overfitting arrives fast, so early stopping and layer-wise decay matter.',
          concepts: ['Head on pooled output', 'Few epochs, small learning rate, warm-up', 'Layer-wise learning-rate decay', 'Catastrophic forgetting'],
          quiz: [
            ['What learning rate is typical for fine-tuning BERT-sized models?', 'Around 2e-5 to 5e-5.'],
            ['What is catastrophic forgetting?', 'Losing pretrained knowledge when fine-tuning updates weights too aggressively.'],
          ],
          prereqs: ['Feature extraction versus fine-tuning', 'Pretrained transformers with Hugging Face'],
        },
        {
          title: 'Parameter-efficient fine-tuning with LoRA',
          description: 'LoRA freezes the base model and trains small low-rank matrices added to attention weights, cutting trainable parameters by orders of magnitude and memory to fit consumer GPUs. Adapters can be merged or swapped per task.',
          concepts: ['Low-rank update matrices', 'Rank and alpha choices', 'Which layers to adapt', 'Merging and swapping adapters'],
          quiz: [
            ['What does LoRA train?', 'Two small matrices whose product approximates the weight update.'],
            ['Why is LoRA memory-efficient?', 'No optimiser state is kept for the frozen base weights.'],
          ],
          prereqs: ['Fine-tuning a transformer for classification'],
        },
      ],
    },
    {
      title: 'Evaluation and Debugging Training',
      description: 'Reading the curves and finding out why a run is broken.',
      topics: [
        {
          title: 'Training and validation curves',
          description: 'Loss and metric curves over steps are the primary instrument: divergence, plateaus, a widening train-validation gap and noisy validation each point at a specific fix. Logging them every run is non-negotiable.',
          concepts: ['Reading loss curves', 'Train-validation gap', 'Plateaus and divergence', 'Smoothing and log scales'],
          quiz: [
            ['What does a loss that drops then rises steadily suggest?', 'Overfitting, or a learning rate that became too high with a schedule bug.'],
            ['What does a loss stuck at ln(number of classes) mean?', 'The model outputs uniform probabilities; it is not learning at all.'],
          ],
          prereqs: ['The training loop and evaluation'],
        },
        {
          title: 'Sanity checks before scaling up',
          description: 'Overfit a single batch to near-zero loss, verify the initial loss matches theory, check that data and labels line up, and confirm gradients are non-zero everywhere. Ten minutes of checks saves days of wasted GPU time.',
          concepts: ['Overfit one batch', 'Expected initial loss', 'Checking data and label alignment', 'Inspecting gradient norms per layer'],
          quiz: [
            ['Why overfit a single batch first?', 'If the model cannot memorise one batch, something is broken in the model, loss or data.'],
            ['What initial loss do you expect for 10-class cross-entropy?', 'About ln(10) ≈ 2.3.'],
          ],
          prereqs: ['Training and validation curves'],
        },
        {
          title: 'Diagnosing under- and overfitting in deep nets',
          description: 'Underfitting calls for more capacity, longer training or a higher learning rate; overfitting for augmentation, regularisation, early stopping or more data. Deep nets usually overfit last, so the order of fixes matters.',
          concepts: ['Capacity and training length', 'Augmentation before regularisation', 'Early stopping on validation', 'Data quantity as the strongest lever'],
          quiz: [
            ['What is usually the first fix for underfitting?', 'Increase model capacity or train longer with a better learning rate.'],
            ['What is the most reliable cure for overfitting?', 'More or better data, then augmentation.'],
          ],
          prereqs: ['Sanity checks before scaling up'],
        },
        {
          title: 'Vanishing, exploding gradients and NaN losses',
          description: 'Gradient norms that collapse or blow up, and losses that turn NaN, come from bad initialisation, high learning rates, missing normalisation or numerical overflow. Clipping, warm-up, mixed-precision scaling and stable losses are the fixes.',
          concepts: ['Monitoring gradient norms', 'Causes of NaN loss', 'Clipping and warm-up fixes', 'Anomaly detection mode'],
          quiz: [
            ['What does torch.autograd.set_detect_anomaly(True) do?', 'Reports the operation that produced a NaN or inf in the backward pass.'],
            ['Name a common source of NaN loss.', 'log(0) from unstable manual softmax, or a learning rate that is too high.'],
          ],
          prereqs: ['Sanity checks before scaling up'],
        },
        {
          title: 'Experiment tracking and reproducibility for deep learning',
          description: 'Log config, metrics, curves, sample predictions and checkpoints per run with TensorBoard, MLflow or Weights & Biases, and fix seeds while knowing which CUDA operations stay nondeterministic. Comparable runs are what make tuning possible.',
          concepts: ['TensorBoard and W&B logging', 'Config as a single source of truth', 'Seeds and cudnn determinism', 'Comparing runs side by side'],
          quiz: [
            ['What does torch.backends.cudnn.deterministic = True change?', 'Forces deterministic convolution algorithms at some speed cost.'],
            ['What should be logged alongside metrics?', 'The full config, code version, data version and sample outputs.'],
          ],
          prereqs: ['Training and validation curves'],
        },
      ],
    },
    {
      title: 'Hardware and Scale',
      description: 'Making training fit and run fast on one GPU, then on many.',
      topics: [
        {
          title: 'GPU fundamentals for deep learning',
          description: 'GPUs run thousands of threads on matrix operations and are limited by memory bandwidth and capacity more than raw compute. Knowing what nvidia-smi shows, what fills VRAM and why small kernels are slow guides every optimisation.',
          concepts: ['Parallelism and matrix operations', 'VRAM: weights, activations, optimiser state', 'Memory bandwidth versus compute', 'Reading nvidia-smi'],
          quiz: [
            ['What occupies most GPU memory when training a large model with Adam?', 'Optimiser state and activations, not just the weights.'],
            ['Why is a batch of tiny operations slow on a GPU?', 'Kernel launch overhead dominates the actual computation.'],
          ],
        },
        {
          title: 'Mixed precision training',
          description: 'Running matmuls in float16 or bfloat16 with float32 master weights roughly doubles speed and halves memory; loss scaling prevents float16 gradient underflow. torch.autocast and GradScaler make it a few lines.',
          concepts: ['float16 versus bfloat16', 'torch.autocast', 'GradScaler and loss scaling', 'When mixed precision breaks'],
          quiz: [
            ['Why does float16 need loss scaling but bfloat16 usually not?', 'float16 has a small exponent range, so small gradients underflow to zero.'],
            ['Which operations stay in float32 under autocast?', 'Reductions and losses that need precision, such as softmax and norms.'],
          ],
          prereqs: ['GPU fundamentals for deep learning'],
        },
        {
          title: 'Fitting bigger models: accumulation and checkpointing',
          description: 'Gradient accumulation simulates a larger batch across several steps, activation checkpointing recomputes activations to trade compute for memory, and smaller optimiser states or 8-bit optimisers help further.',
          concepts: ['Gradient accumulation', 'Activation checkpointing', 'Reducing optimiser memory', 'Batch size versus sequence length trade-offs'],
          quiz: [
            ['What does gradient accumulation over 4 steps emulate?', 'A batch four times larger, at the same memory cost.'],
            ['What does activation checkpointing trade?', 'Extra forward computation for lower memory.'],
          ],
          prereqs: ['Mixed precision training'],
        },
        {
          title: 'Data-parallel training with DDP',
          description: 'DistributedDataParallel runs a copy of the model per GPU, splits each batch across them and all-reduces gradients so every copy stays identical. It is the standard way to use several GPUs and needs a DistributedSampler and careful logging.',
          concepts: ['Process per GPU and all-reduce', 'DistributedSampler', 'Effective batch size and learning rate', 'Logging from rank zero'],
          quiz: [
            ['What does DDP synchronise between GPUs?', 'Gradients, averaged after each backward pass.'],
            ['Why scale the learning rate with the number of GPUs?', 'The effective batch size grows, so the step size often should too.'],
          ],
          prereqs: ['Fitting bigger models: accumulation and checkpointing'],
        },
        {
          title: 'Sharding and multi-node basics',
          description: 'When a model no longer fits on one GPU, FSDP or ZeRO shard weights, gradients and optimiser state across devices, and multi-node runs add network bandwidth as the bottleneck. Knowing the vocabulary lets you read training reports and choose a strategy.',
          concepts: ['FSDP and ZeRO sharding', 'Tensor and pipeline parallelism', 'Interconnect bandwidth limits', 'Choosing a parallelism strategy'],
          quiz: [
            ['What does FSDP shard?', 'Parameters, gradients and optimiser state across GPUs.'],
            ['When is pipeline parallelism used?', 'When even one layer\'s activations and weights need to be split across devices by stage.'],
          ],
          prereqs: ['Data-parallel training with DDP'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: MLP from scratch in numpy, then PyTorch',
          description: 'Implement a two-layer network with manual forward and backward passes in numpy on a digits dataset, verify gradients numerically, then rebuild it in PyTorch and confirm identical results, comparing training curves and speed.',
          concepts: ['Forward and backward by hand', 'Gradient check', 'Port to PyTorch', 'Compare curves and speed'],
          quiz: [
            ['How do you verify a hand-written backward pass?', 'Compare it to finite-difference gradients on a few parameters.'],
            ['Why should the numpy and PyTorch versions match?', 'Same architecture, initialisation and data give the same loss trajectory.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: image classifier with transfer learning',
          description: 'Fine-tune a pretrained ResNet on a custom image dataset with augmentation, mixed precision, a cosine schedule and early stopping; report accuracy, a confusion matrix and misclassified examples, and export the model to ONNX.',
          concepts: ['Data pipeline with augmentation', 'Fine-tune with AMP and a schedule', 'Evaluate and inspect errors', 'Export to ONNX'],
          quiz: [
            ['Why inspect misclassified images?', 'They reveal label errors and systematic confusions to fix.'],
            ['What does exporting to ONNX enable?', 'Inference outside PyTorch with runtimes such as ONNX Runtime.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: text classifier by fine-tuning a transformer',
          description: 'Fine-tune a small pretrained transformer on a sentiment or topic dataset with Hugging Face, compare full fine-tuning against LoRA on accuracy, time and memory, and serve predictions through a minimal script.',
          concepts: ['Tokenise and build datasets', 'Fine-tune fully and with LoRA', 'Compare accuracy, time and memory', 'Serve predictions'],
          quiz: [
            ['What do you expect LoRA to change versus full fine-tuning?', 'Far less memory and trainable parameters with a small or no accuracy drop.'],
            ['Which metric for an imbalanced sentiment dataset?', 'Macro F1 rather than accuracy.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: character-level language model',
          description: 'Train a small decoder-only transformer on a text corpus to predict the next character: implement the attention block, causal mask and sampling with temperature, track perplexity, and compare against an LSTM baseline.',
          concepts: ['Build the data and tokeniser', 'Implement the causal transformer', 'Train and track perplexity', 'Sample and compare with an LSTM'],
          quiz: [
            ['What is perplexity?', 'The exponential of the average cross-entropy per token.'],
            ['What does a higher sampling temperature do?', 'Flattens the distribution, producing more random text.'],
          ],
          style: 'project',
        },
        {
          title: 'Deep learning interview questions',
          description: 'The recurring questions: why ReLU, batch norm versus layer norm, how backprop works, Adam versus SGD, dropout at inference, vanishing gradients, why attention scales, transfer learning strategy, and how you would debug a run that does not learn.',
          concepts: ['Architecture and activation questions', 'Optimisation questions', 'Transformer questions', 'Debugging scenario questions'],
          quiz: [
            ['Why do transformers scale better than RNNs?', 'Attention processes all positions in parallel instead of sequentially.'],
            ['What would you check first if training loss never decreases?', 'Learning rate, data-label alignment and whether one batch can be overfitted.'],
          ],
          style: 'reading',
        },
        {
          title: 'Implementing deep learning components live',
          description: 'Practise writing scaled dot-product attention, a training loop, a custom Dataset and a residual block from memory in PyTorch under time pressure, explaining shapes and design decisions while typing.',
          concepts: ['Attention from scratch', 'Training loop from memory', 'Residual block and Dataset', 'Explaining shapes aloud'],
          quiz: [
            ['What are the shapes in scaled dot-product attention with batch B, length n, dimension d?', 'Q, K, V are (B, n, d); scores are (B, n, n).'],
            ['What must a residual block preserve?', 'The shape, so the input can be added to the output.'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
