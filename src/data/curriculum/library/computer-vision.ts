import { defineTrack } from '../define'

export const computerVision = defineTrack({
  id: 'track-computer-vision',
  title: 'Computer Vision',
  description: 'Images as arrays through classical filtering, CNNs, detection, segmentation, vision transformers and CLIP, with the datasets, labelling, evaluation and deployment work that turns a model into a working vision system.',
  family: 'AI & Generative AI',
  kind: 'domain',
  icon: '👁️',
  tags: ['computer-vision', 'cnn', 'object-detection', 'segmentation', 'yolo', 'vit', 'clip', 'opencv', 'pytorch'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-deep-learning'],
  style: 'practice',
  categories: [
    {
      title: 'Images as Data',
      description: 'What a picture is once it is in memory.',
      topics: [
        {
          title: 'Images as NumPy arrays',
          description: 'A raster image is a height by width by channels array of integers or floats; how indexing, slicing, dtype and value range (0-255 versus 0-1) work, and why channel order (HWC versus CHW, RGB versus BGR) causes so many bugs.',
          concepts: ['Height, width and channel axes', 'uint8 versus float ranges', 'HWC and CHW layouts', 'RGB versus BGR order'],
          quiz: [
            ['What shape does PyTorch expect for a batch of images?', '(N, C, H, W).'],
            ['Which library loads images in BGR order by default?', 'OpenCV.'],
          ],
        },
        {
          title: 'Colour spaces and channels',
          description: 'RGB, grayscale, HSV and LAB and what each separates: HSV isolates hue for colour-based masking, LAB approximates perceptual distance, and grayscale conversion weights channels by luminance.',
          concepts: ['Grayscale conversion weights', 'HSV for colour thresholding', 'LAB and perceptual distance', 'Alpha channels and transparency'],
          quiz: [
            ['Why threshold in HSV rather than RGB to find a red object?', 'Hue stays stable under lighting changes that shift all RGB channels.'],
            ['Which channel gets the largest weight in luminance grayscale?', 'Green, about 0.59 or 0.7152 depending on the standard.'],
          ],
          prereqs: ['Images as NumPy arrays'],
        },
        {
          title: 'Loading and manipulating images with OpenCV and PIL',
          description: 'Reading, resizing, cropping, rotating and saving images with OpenCV and Pillow, how interpolation choices change results, and converting between PIL, NumPy and torch tensors without silent channel or range errors.',
          concepts: ['cv2.imread and PIL.Image.open', 'Resizing and interpolation modes', 'Cropping and rotating', 'Converting to and from tensors'],
          quiz: [
            ['Which interpolation is best when shrinking an image?', 'Area (INTER_AREA) interpolation, which averages source pixels.'],
            ['What does torchvision ToTensor() do to pixel values?', 'Scales uint8 0-255 to float 0-1 and moves channels first.'],
          ],
          prereqs: ['Images as NumPy arrays'],
        },
        {
          title: 'Histograms and contrast',
          description: 'Counting pixel intensities to understand exposure, stretching and equalising histograms to improve contrast, and CLAHE for local equalisation that does not blow out bright regions.',
          concepts: ['Intensity histograms', 'Histogram equalisation', 'CLAHE', 'Gamma correction'],
          quiz: [
            ['What does histogram equalisation do?', 'Spreads intensities so the cumulative distribution becomes roughly linear.'],
            ['Why CLAHE instead of global equalisation?', 'It equalises local tiles and clips amplification, avoiding noise blow-up.'],
          ],
          prereqs: ['Colour spaces and channels'],
        },
      ],
    },
    {
      title: 'Classical Image Processing',
      description: 'Filters and geometry that still power preprocessing and simple pipelines.',
      topics: [
        {
          title: 'Convolution and filtering kernels',
          description: 'Sliding a small kernel over an image to blur, sharpen or detect structure: box and Gaussian blur, padding modes, separable filters and why this is the same operation a CNN learns.',
          concepts: ['Kernel sliding and padding', 'Gaussian and box blur', 'Sharpening kernels', 'Separable filters'],
          quiz: [
            ['Why is a Gaussian blur separable?', 'The 2D Gaussian equals the outer product of two 1D Gaussians, so two 1D passes suffice.'],
            ['What is the sum of a normalised blur kernel?', 'One, so average brightness is preserved.'],
          ],
          prereqs: ['Images as NumPy arrays'],
        },
        {
          title: 'Edge detection with Sobel and Canny',
          description: 'Gradients as edge evidence: Sobel operators estimate horizontal and vertical derivatives, magnitude and direction combine them, and Canny adds non-maximum suppression and hysteresis thresholds for thin, connected edges.',
          concepts: ['Sobel gradient operators', 'Gradient magnitude and direction', 'Non-maximum suppression in Canny', 'Hysteresis thresholds'],
          quiz: [
            ['Why blur before edge detection?', 'Derivatives amplify noise; smoothing suppresses it first.'],
            ['What do Canny\'s two thresholds do?', 'Strong edges start above the high threshold; weak edges are kept only if connected to strong ones.'],
          ],
          prereqs: ['Convolution and filtering kernels'],
        },
        {
          title: 'Geometric transforms and warping',
          description: 'Translation, rotation, scaling, affine and perspective transforms as matrices, applying them with cv2.warpAffine and warpPerspective, and using homographies to rectify documents or stitch panoramas.',
          concepts: ['Affine transform matrices', 'Perspective transforms and homographies', 'Inverse mapping and interpolation', 'Document rectification'],
          quiz: [
            ['How many point pairs define a homography?', 'Four non-collinear pairs.'],
            ['Why does warping use inverse mapping?', 'Each output pixel samples the source, so there are no holes in the result.'],
          ],
          prereqs: ['Images as NumPy arrays'],
        },
        {
          title: 'Thresholding and morphology',
          description: 'Turning grayscale into binary masks with global, Otsu and adaptive thresholds, then cleaning them with erosion, dilation, opening and closing, and extracting connected components and contours.',
          concepts: ['Otsu and adaptive thresholding', 'Erosion and dilation', 'Opening and closing', 'Connected components and contours'],
          quiz: [
            ['How does Otsu pick a threshold?', 'It minimises within-class intensity variance between foreground and background.'],
            ['What does an opening operation remove?', 'Small bright specks, by eroding then dilating.'],
          ],
          prereqs: ['Histograms and contrast'],
        },
        {
          title: 'Feature descriptors and matching',
          description: 'Keypoint detectors and descriptors (SIFT, ORB) that describe local patches invariantly to scale and rotation, matching them between images with ratio tests, and RANSAC to reject bad matches when estimating a transform.',
          concepts: ['Keypoint detection', 'SIFT and ORB descriptors', 'Lowe ratio test matching', 'RANSAC for robust estimation'],
          quiz: [
            ['What does the ratio test filter out?', 'Matches whose best and second-best distances are too similar to be reliable.'],
            ['Why is ORB popular on mobile?', 'It is fast, binary and patent-free.'],
          ],
          prereqs: ['Geometric transforms and warping'],
        },
      ],
    },
    {
      title: 'Convolutional Networks',
      description: 'The architectures that learn their own filters.',
      topics: [
        {
          title: 'Convolution layers, receptive fields and pooling',
          description: 'How stacked convolutions grow the receptive field, what stride, padding and dilation do to output size, and why pooling and strided convolutions trade resolution for invariance and compute.',
          concepts: ['Output size arithmetic', 'Receptive field growth', 'Stride, padding and dilation', 'Max and average pooling'],
          quiz: [
            ['Output size of a 3x3 conv, stride 1, padding 1 on 32x32?', '32x32.'],
            ['What does global average pooling replace?', 'The flatten plus large fully connected layers at the end of a CNN.'],
          ],
          prereqs: ['Convolution and filtering kernels'],
        },
        {
          title: 'Building a CNN in PyTorch',
          description: 'Assembling nn.Conv2d, BatchNorm2d, ReLU and pooling into a classifier, writing the training loop with DataLoader, and checking shapes, parameter counts and a first overfit on a tiny batch.',
          concepts: ['Conv-BN-ReLU blocks', 'Dataset and DataLoader for images', 'Training loop with validation', 'Overfitting a single batch as a check'],
          quiz: [
            ['Why overfit one batch before a full run?', 'It proves the model and loop can learn at all before spending hours.'],
            ['Why is bias unnecessary in a conv followed by BatchNorm?', 'BatchNorm\'s beta parameter subsumes it.'],
          ],
          prereqs: ['Convolution layers, receptive fields and pooling'],
        },
        {
          title: 'ResNet and residual connections',
          description: 'Skip connections let a block learn a residual on top of identity, which makes very deep networks trainable; bottleneck blocks, downsampling shortcuts and the ResNet-18 to ResNet-152 family.',
          concepts: ['Identity shortcuts', 'Bottleneck blocks', 'Downsampling with 1x1 convolutions', 'ResNet variants and depth'],
          quiz: [
            ['What does a residual block learn?', 'F(x) such that the output is x + F(x).'],
            ['Why do skip connections help optimisation?', 'Gradients flow directly through the identity path.'],
          ],
          prereqs: ['Building a CNN in PyTorch'],
        },
        {
          title: 'EfficientNet and compound scaling',
          description: 'Scaling depth, width and resolution together with a single coefficient, the MBConv block with squeeze-and-excitation, and the accuracy-per-FLOP curve that made EfficientNet a default backbone.',
          concepts: ['Compound scaling coefficient', 'MBConv blocks', 'Squeeze-and-excitation', 'Accuracy versus FLOPs curves'],
          quiz: [
            ['What three dimensions does compound scaling adjust?', 'Depth, width and input resolution.'],
            ['What does squeeze-and-excitation reweight?', 'Channels, using a small gating network on pooled features.'],
          ],
          prereqs: ['ResNet and residual connections'],
        },
        {
          title: 'MobileNet and depthwise separable convolutions',
          description: 'Splitting a convolution into a per-channel depthwise pass and a 1x1 pointwise mix cuts compute by roughly the kernel area, which is how MobileNet and similar models run on phones.',
          concepts: ['Depthwise convolution', 'Pointwise 1x1 mixing', 'FLOP savings arithmetic', 'Inverted residuals in MobileNetV2'],
          quiz: [
            ['Roughly how much cheaper is a depthwise separable 3x3 conv?', 'About 8 to 9 times fewer multiply-adds.'],
            ['What is an inverted residual?', 'A block that expands channels, applies depthwise conv, then projects back down.'],
          ],
          prereqs: ['ResNet and residual connections'],
        },
      ],
    },
    {
      title: 'Training Vision Models',
      description: 'The recipes that separate a paper result from a stalled run.',
      topics: [
        {
          title: 'Data augmentation',
          description: 'Random crops, flips, colour jitter, RandAugment, Mixup and CutMix as regularisers that teach invariances, applied with torchvision transforms or Albumentations, and the augmentations that break for certain tasks.',
          concepts: ['Geometric and colour augmentations', 'RandAugment and AutoAugment', 'Mixup and CutMix', 'Albumentations pipelines', 'Augmentations that change labels'],
          quiz: [
            ['Why is horizontal flip wrong for digit recognition?', 'It changes the meaning of asymmetric characters.'],
            ['What does Mixup do to labels?', 'Blends them with the same coefficient as the images.'],
          ],
          prereqs: ['Building a CNN in PyTorch'],
        },
        {
          title: 'Transfer learning and fine-tuning',
          description: 'Starting from ImageNet-pretrained weights, replacing the head, choosing between freezing the backbone and fine-tuning end to end, using lower learning rates for pretrained layers, and matching the normalisation statistics.',
          concepts: ['Pretrained backbones from timm and torchvision', 'Replacing the classification head', 'Freezing versus full fine-tuning', 'Discriminative learning rates', 'ImageNet normalisation stats'],
          quiz: [
            ['When should you freeze the backbone?', 'Small datasets close to the pretraining domain, or when compute is tight.'],
            ['Why normalise with ImageNet mean and std?', 'The pretrained weights expect inputs in that distribution.'],
          ],
          prereqs: ['ResNet and residual connections'],
        },
        {
          title: 'Learning rate schedules and training recipes',
          description: 'Warmup, cosine decay and one-cycle schedules, label smoothing, weight decay and EMA weights: the standard modern recipe and how to find a learning rate with a range test.',
          concepts: ['Warmup and cosine decay', 'One-cycle policy', 'Label smoothing', 'EMA of weights', 'Learning rate range test'],
          quiz: [
            ['What does warmup prevent?', 'Early divergence when BatchNorm statistics and weights are still random.'],
            ['What does label smoothing change?', 'Targets become 1-eps for the true class and eps spread over the rest.'],
          ],
          prereqs: ['Transfer learning and fine-tuning'],
        },
        {
          title: 'Class imbalance and label noise',
          description: 'Weighted sampling, class-weighted losses and focal loss for rare classes, and finding mislabelled images with loss ranking or confident-learning tools before they poison training.',
          concepts: ['Weighted random sampling', 'Class-weighted cross-entropy', 'Focal loss', 'Finding mislabelled images'],
          quiz: [
            ['What does focal loss down-weight?', 'Easy, well-classified examples, so hard ones dominate the gradient.'],
            ['How do you find likely label errors?', 'Rank training examples by loss or use cleanlab-style confident learning.'],
          ],
          prereqs: ['Learning rate schedules and training recipes'],
        },
        {
          title: 'Mixed precision and GPU throughput',
          description: 'torch.autocast and GradScaler for float16 or bfloat16 training, channels_last memory format, DataLoader workers and pinned memory, and profiling to find whether the GPU or the input pipeline is the bottleneck.',
          concepts: ['autocast and GradScaler', 'bfloat16 versus float16', 'DataLoader workers and pin_memory', 'Profiling the input pipeline'],
          quiz: [
            ['Why does float16 need a GradScaler?', 'Small gradients underflow to zero without scaling.'],
            ['GPU utilisation is 30 percent; what is the likely cause?', 'The data loader cannot feed batches fast enough.'],
          ],
          prereqs: ['Building a CNN in PyTorch'],
        },
      ],
    },
    {
      title: 'Image Classification',
      description: 'The first task and still the backbone of the rest.',
      topics: [
        {
          title: 'Multi-class and multi-label classification',
          description: 'Softmax with cross-entropy for one label per image versus sigmoid with binary cross-entropy for several, building the dataset and loss for each, and choosing thresholds per label.',
          concepts: ['Softmax versus per-label sigmoid', 'Encoding multi-label targets', 'Per-label thresholds', 'Hierarchical labels'],
          quiz: [
            ['Which loss for an image that can contain a cat and a dog?', 'Binary cross-entropy with sigmoid outputs per class.'],
            ['Why not argmax for multi-label?', 'It returns exactly one class when several may be present.'],
          ],
          prereqs: ['Transfer learning and fine-tuning'],
        },
        {
          title: 'Fine-grained recognition and metric learning',
          description: 'When classes differ by tiny details (bird species, product SKUs) or new classes appear constantly, train an embedding with triplet or ArcFace loss and classify by nearest neighbour instead of a fixed head.',
          concepts: ['Fine-grained classification challenges', 'Triplet loss and hard mining', 'ArcFace and margin losses', 'Nearest-neighbour classification on embeddings'],
          quiz: [
            ['Why metric learning for face recognition?', 'New identities can be added without retraining a classifier head.'],
            ['What does a triplet loss push apart?', 'An anchor from a negative, by a margin more than from its positive.'],
          ],
          prereqs: ['Multi-class and multi-label classification'],
        },
        {
          title: 'Self-supervised pretraining',
          description: 'Learning visual features without labels: contrastive methods (SimCLR, MoCo), self-distillation (DINO) and masked autoencoders (MAE), and when self-supervised backbones beat ImageNet weights for your domain.',
          concepts: ['Contrastive learning with SimCLR', 'DINO self-distillation', 'Masked autoencoders', 'Linear probing versus fine-tuning'],
          quiz: [
            ['What is a linear probe?', 'A linear classifier trained on frozen features to measure their quality.'],
            ['What does MAE reconstruct?', 'Masked image patches from the visible ones.'],
          ],
          prereqs: ['Transfer learning and fine-tuning'],
        },
      ],
    },
    {
      title: 'Object Detection',
      description: 'Finding what is where.',
      topics: [
        {
          title: 'Bounding boxes, anchors and NMS',
          description: 'Box formats (xyxy, xywh, normalised), anchor boxes as priors for regression, IoU for matching predictions to ground truth, and non-maximum suppression to collapse duplicate detections.',
          concepts: ['Box formats and conversions', 'Anchor boxes and priors', 'Matching predictions by IoU', 'Non-maximum suppression'],
          quiz: [
            ['What does NMS remove?', 'Lower-scoring boxes that overlap a higher-scoring box above an IoU threshold.'],
            ['What does YOLO\'s txt format store per box?', 'class, centre x, centre y, width, height, all normalised to 0-1.'],
          ],
          prereqs: ['Multi-class and multi-label classification'],
        },
        {
          title: 'Two-stage detectors: Faster R-CNN',
          description: 'A region proposal network suggests candidate boxes, RoI pooling or RoIAlign crops features for each, and a second head classifies and refines them; accurate, slower, and available in torchvision.',
          concepts: ['Region proposal network', 'RoIAlign feature cropping', 'Classification and box refinement heads', 'Feature pyramid networks'],
          quiz: [
            ['What does the RPN output?', 'Objectness scores and box offsets for anchors.'],
            ['Why an FPN?', 'To detect objects at multiple scales from features of different resolutions.'],
          ],
          prereqs: ['Bounding boxes, anchors and NMS'],
        },
        {
          title: 'One-stage detectors: YOLO and RetinaNet',
          description: 'Predicting classes and boxes directly from a grid of feature cells in a single pass, the anchor-free heads of recent YOLO versions, and focal loss in RetinaNet to handle the flood of background cells.',
          concepts: ['Grid-cell prediction', 'Anchor-free detection heads', 'Focal loss for background imbalance', 'Speed versus accuracy trade-offs'],
          quiz: [
            ['Why are one-stage detectors faster?', 'They skip the separate proposal stage and predict everything in one pass.'],
            ['What problem does focal loss solve in RetinaNet?', 'The overwhelming number of easy background examples.'],
          ],
          prereqs: ['Bounding boxes, anchors and NMS'],
        },
        {
          title: 'DETR and transformer-based detection',
          description: 'Treating detection as set prediction: learned object queries attend over image features, Hungarian matching pairs predictions with targets, and NMS disappears; the convergence fixes in Deformable DETR and RT-DETR.',
          concepts: ['Object queries', 'Hungarian matching loss', 'Set prediction without NMS', 'Deformable attention'],
          quiz: [
            ['Why does DETR not need NMS?', 'Bipartite matching trains each object to be predicted by exactly one query.'],
            ['What slowed the original DETR training?', 'Dense global attention over all pixels, fixed by deformable attention.'],
          ],
          prereqs: ['One-stage detectors: YOLO and RetinaNet'],
        },
        {
          title: 'Training a detector on a custom dataset',
          description: 'Converting annotations to the format a framework expects, fine-tuning an Ultralytics YOLO or torchvision Faster R-CNN, validating mAP, and the common failures: wrong box normalisation, class id offsets, tiny objects.',
          concepts: ['Preparing annotations and data configs', 'Fine-tuning with Ultralytics YOLO', 'Fine-tuning torchvision detectors', 'Diagnosing detection failures'],
          quiz: [
            ['Why does class index 0 matter in torchvision detection?', 'It is reserved for background.'],
            ['Small objects are missed; what are two fixes?', 'Train at higher resolution or use image tiling.'],
          ],
          prereqs: ['One-stage detectors: YOLO and RetinaNet', 'Data augmentation'],
        },
      ],
    },
    {
      title: 'Segmentation',
      description: 'Labelling every pixel.',
      topics: [
        {
          title: 'Semantic segmentation with U-Net and DeepLab',
          description: 'Predicting a class per pixel with an encoder-decoder, the U-Net skip connections that recover fine detail, atrous convolutions in DeepLab for wide context, and per-pixel cross-entropy training.',
          concepts: ['Encoder-decoder with skip connections', 'Upsampling and transposed convolutions', 'Atrous convolutions in DeepLab', 'Per-pixel cross-entropy'],
          quiz: [
            ['Why does U-Net concatenate encoder features into the decoder?', 'To restore spatial detail lost during downsampling.'],
            ['What does an atrous (dilated) convolution give?', 'A larger receptive field without reducing resolution.'],
          ],
          prereqs: ['ResNet and residual connections'],
        },
        {
          title: 'Instance segmentation with Mask R-CNN',
          description: 'Extending Faster R-CNN with a mask head that predicts a binary mask per detected object, RoIAlign to keep masks pixel-accurate, and how instance differs from semantic and panoptic segmentation.',
          concepts: ['Mask head per RoI', 'Semantic versus instance versus panoptic', 'RoIAlign for mask precision', 'Mask post-processing'],
          quiz: [
            ['What does instance segmentation add over semantic?', 'It separates individual objects of the same class.'],
            ['What is panoptic segmentation?', 'Instance masks for things plus semantic labels for stuff, covering every pixel.'],
          ],
          prereqs: ['Two-stage detectors: Faster R-CNN', 'Semantic segmentation with U-Net and DeepLab'],
        },
        {
          title: 'Promptable segmentation with Segment Anything',
          description: 'SAM segments any object from a point, box or mask prompt using a heavy image encoder and a light prompt decoder; using it for zero-shot masks, fast annotation and as a component in pipelines.',
          concepts: ['Image encoder and prompt decoder', 'Point and box prompts', 'Automatic mask generation', 'SAM for annotation workflows'],
          quiz: [
            ['Why is SAM fast for interactive use?', 'The image is encoded once; each prompt runs only the light decoder.'],
            ['Does SAM label the class of a mask?', 'No, it produces masks without semantic labels.'],
          ],
          prereqs: ['Semantic segmentation with U-Net and DeepLab'],
        },
        {
          title: 'Segmentation losses',
          description: 'Cross-entropy alone fails on small foregrounds; Dice and IoU losses optimise overlap directly, combined losses stabilise training, and boundary-aware losses sharpen edges.',
          concepts: ['Dice loss', 'Soft IoU loss', 'Combining cross-entropy and Dice', 'Foreground imbalance in masks'],
          quiz: [
            ['Why does Dice loss help with small objects?', 'It measures overlap relative to object size rather than counting all pixels.'],
            ['What is a soft Dice coefficient?', 'Dice computed on predicted probabilities instead of hard masks, so it is differentiable.'],
          ],
          prereqs: ['Semantic segmentation with U-Net and DeepLab'],
        },
      ],
    },
    {
      title: 'Vision Transformers and Multimodal Models',
      description: 'Attention replaces convolution, and text joins the picture.',
      topics: [
        {
          title: 'ViT: patches as tokens',
          description: 'Splitting an image into 16x16 patches, linearly embedding each as a token with a position embedding, and running a standard transformer encoder; why ViT needs lots of data or strong pretraining to beat CNNs.',
          concepts: ['Patch embedding', 'Class token and position embeddings', 'Transformer encoder on patches', 'Data hunger and inductive bias'],
          quiz: [
            ['How many tokens does a 224x224 image give with 16x16 patches?', '196, plus a class token.'],
            ['Why do CNNs win on small datasets?', 'Their locality and translation equivariance are built-in biases ViT must learn.'],
          ],
          prereqs: ['Self-supervised pretraining'],
        },
        {
          title: 'Swin and hierarchical vision transformers',
          description: 'Windowed attention with shifted windows keeps cost linear in image size while building a feature pyramid, which makes Swin a drop-in backbone for detection and segmentation.',
          concepts: ['Windowed self-attention', 'Shifted windows', 'Patch merging for hierarchy', 'Swin as a detection backbone'],
          quiz: [
            ['Why shift the windows between layers?', 'So information can flow across window boundaries.'],
            ['What does patch merging do?', 'Halves resolution and doubles channels, like a CNN stage.'],
          ],
          prereqs: ['ViT: patches as tokens'],
        },
        {
          title: 'CLIP and contrastive image-text pretraining',
          description: 'Training an image encoder and a text encoder so matching pairs have high cosine similarity across a batch, which yields a shared embedding space usable for retrieval and zero-shot classification.',
          concepts: ['Dual encoders', 'Contrastive loss over a batch', 'Shared image-text embedding space', 'Open-vocabulary recognition'],
          quiz: [
            ['What are the positives in CLIP\'s contrastive loss?', 'The matching image-caption pairs on the diagonal of the similarity matrix.'],
            ['Why does CLIP need huge batches?', 'More in-batch negatives make the contrastive task harder and the embeddings better.'],
          ],
          prereqs: ['ViT: patches as tokens'],
        },
        {
          title: 'Zero-shot classification and retrieval with CLIP',
          description: 'Classifying by comparing an image embedding with text embeddings of prompts like "a photo of a {label}", prompt ensembling, and building image search where the query is text or another image.',
          concepts: ['Prompt templates for labels', 'Prompt ensembling', 'Text-to-image retrieval', 'Image-to-image retrieval'],
          quiz: [
            ['How does zero-shot CLIP classification work?', 'Pick the label whose prompt embedding is closest to the image embedding.'],
            ['Why ensemble several prompt templates?', 'It averages out wording sensitivity and improves accuracy.'],
          ],
          prereqs: ['CLIP and contrastive image-text pretraining'],
        },
        {
          title: 'Vision-language models',
          description: 'Models that generate text from images (BLIP-2, LLaVA, PaliGemma): a vision encoder, a projector and a language model, used for captioning, visual question answering and document understanding.',
          concepts: ['Vision encoder plus projector plus LLM', 'Image captioning', 'Visual question answering', 'Document and chart understanding'],
          quiz: [
            ['What does the projector in LLaVA do?', 'Maps vision encoder features into the language model\'s token embedding space.'],
            ['What is VQA?', 'Answering natural-language questions about an image.'],
          ],
          prereqs: ['CLIP and contrastive image-text pretraining'],
        },
      ],
    },
    {
      title: 'Evaluation',
      description: 'Metrics that match the task.',
      topics: [
        {
          title: 'Intersection over union',
          description: 'IoU as the overlap ratio between predicted and true regions for boxes and masks, computing it correctly with edge cases, and choosing the IoU threshold that defines a true positive.',
          concepts: ['IoU for boxes', 'IoU for masks', 'True positive thresholds', 'Vectorised IoU computation'],
          quiz: [
            ['What IoU threshold defines a match in Pascal VOC?', '0.5.'],
            ['Two boxes do not overlap; what is their IoU?', 'Zero.'],
          ],
          prereqs: ['Bounding boxes, anchors and NMS'],
        },
        {
          title: 'Precision-recall curves and mAP',
          description: 'Ranking detections by confidence, tracing precision against recall, averaging precision per class and across IoU thresholds as in COCO mAP@[.5:.95], and reading the metrics tools like pycocotools print.',
          concepts: ['Ranking detections by confidence', 'Average precision per class', 'COCO mAP at multiple IoU thresholds', 'Reading pycocotools output'],
          quiz: [
            ['What does mAP@[.5:.95] average over?', 'IoU thresholds from 0.5 to 0.95 in steps of 0.05, then over classes.'],
            ['Why does a confidence threshold not affect AP?', 'AP integrates over all thresholds via the precision-recall curve.'],
          ],
          prereqs: ['Intersection over union'],
        },
        {
          title: 'Segmentation metrics',
          description: 'Pixel accuracy is dominated by background; mean IoU per class and Dice reflect what matters, boundary F-score captures edge quality, and panoptic quality combines recognition and segmentation.',
          concepts: ['Pixel accuracy pitfalls', 'Mean IoU per class', 'Dice coefficient', 'Boundary F-score and panoptic quality'],
          quiz: [
            ['Why is pixel accuracy misleading?', 'Predicting all background scores high when foreground is small.'],
            ['How does Dice relate to IoU?', 'Dice = 2*IoU / (1 + IoU).'],
          ],
          prereqs: ['Semantic segmentation with U-Net and DeepLab'],
        },
        {
          title: 'Classification metrics, calibration and error analysis',
          description: 'Top-1 and top-5 accuracy, confusion matrices and per-class recall, calibration with reliability diagrams and temperature scaling, and Grad-CAM to see what the model looked at when it was wrong.',
          concepts: ['Top-k accuracy', 'Confusion matrices per class', 'Calibration and temperature scaling', 'Grad-CAM for error analysis'],
          quiz: [
            ['What does temperature scaling change?', 'The softmax sharpness, improving calibration without changing accuracy.'],
            ['What does Grad-CAM visualise?', 'Which image regions most influenced a class score.'],
          ],
          prereqs: ['Multi-class and multi-label classification'],
        },
      ],
    },
    {
      title: 'Datasets and Labelling',
      description: 'Where the real cost of a vision project lives.',
      topics: [
        {
          title: 'Standard datasets and benchmarks',
          description: 'ImageNet, COCO, Pascal VOC, Cityscapes and Open Images: what each labels, their licences, and how to load them through torchvision or Hugging Face datasets for pretraining and benchmarking.',
          concepts: ['ImageNet and its role in pretraining', 'COCO tasks and splits', 'Cityscapes and domain-specific sets', 'Dataset licences'],
          quiz: [
            ['How many object categories does COCO annotate?', '80.'],
            ['Why check a dataset licence?', 'Many benchmark sets forbid commercial use.'],
          ],
        },
        {
          title: 'Annotation formats',
          description: 'COCO JSON with images, annotations and categories arrays, Pascal VOC XML per image, YOLO txt per image, and mask formats (PNG index masks, RLE); converting between them without losing boxes.',
          concepts: ['COCO JSON structure', 'Pascal VOC XML', 'YOLO txt files', 'Mask encodings: index PNG and RLE', 'Format conversion tools'],
          quiz: [
            ['Which format stores boxes as x, y, width, height in pixels?', 'COCO JSON.'],
            ['What is RLE in COCO masks?', 'Run-length encoding of the binary mask.'],
          ],
          prereqs: ['Standard datasets and benchmarks'],
        },
        {
          title: 'Labelling tools and workflows',
          description: 'Setting up CVAT or Label Studio, writing guidelines with examples of hard cases, model-assisted pre-labelling with SAM or a current model, review passes and measuring annotator agreement.',
          concepts: ['CVAT and Label Studio setup', 'Labelling guidelines for images', 'Model-assisted pre-labelling', 'Review and agreement checks'],
          quiz: [
            ['Why pre-label with a model?', 'Correcting is faster than drawing from scratch.'],
            ['What is a common source of box disagreement?', 'Whether to include occluded or truncated parts of an object.'],
          ],
          prereqs: ['Annotation formats'],
        },
        {
          title: 'Dataset quality, bias and splits',
          description: 'Duplicate and near-duplicate leakage between splits, splitting by scene or capture session rather than by image, spotting spurious correlations (backgrounds, watermarks) and checking coverage across conditions.',
          concepts: ['Near-duplicate detection', 'Group-aware splitting', 'Spurious correlations and shortcuts', 'Coverage across conditions'],
          quiz: [
            ['Why split by video or session rather than frame?', 'Adjacent frames are near-identical and leak test data into training.'],
            ['What is a shortcut feature?', 'A spurious cue like a background that predicts the label in training but not in deployment.'],
          ],
          prereqs: ['Standard datasets and benchmarks'],
        },
      ],
    },
    {
      title: 'Deployment Considerations',
      description: 'From a notebook to a camera feed.',
      topics: [
        {
          title: 'Exporting models with TorchScript and ONNX',
          description: 'Tracing or scripting a model, exporting to ONNX with dynamic batch axes, verifying outputs match, and running with ONNX Runtime or TensorRT; the ops and preprocessing steps that do not export.',
          concepts: ['torch.export and TorchScript tracing', 'ONNX export with dynamic axes', 'Verifying numerical parity', 'TensorRT and ONNX Runtime backends'],
          quiz: [
            ['Why check outputs after export?', 'Unsupported ops or tracing on one input shape can silently change behaviour.'],
            ['What does a dynamic axis allow?', 'Different batch sizes or resolutions at inference time.'],
          ],
          prereqs: ['Building a CNN in PyTorch'],
        },
        {
          title: 'Quantisation and pruning for edge devices',
          description: 'Post-training and quantisation-aware int8 to shrink and speed up models, structured pruning, and the accuracy checks needed before shipping to phones, Jetson boards or browsers.',
          concepts: ['Post-training quantisation', 'Quantisation-aware training', 'Structured pruning', 'Edge runtimes: TFLite, CoreML, Jetson'],
          quiz: [
            ['When is quantisation-aware training worth it?', 'When post-training int8 loses too much accuracy.'],
            ['What does int8 quantisation typically cut?', 'Model size by 4x and latency substantially on supported hardware.'],
          ],
          prereqs: ['Exporting models with TorchScript and ONNX'],
        },
        {
          title: 'Real-time video pipelines',
          description: 'Decoding frames, batching or skipping to hit a frame budget, running detection then tracking (ByteTrack, DeepSORT) to keep identities, and measuring end-to-end latency including preprocessing.',
          concepts: ['Frame decoding and buffering', 'Frame skipping and batching', 'Multi-object tracking', 'End-to-end latency budgets'],
          quiz: [
            ['Why add a tracker after a detector?', 'To keep consistent object ids across frames and smooth detections.'],
            ['Where does latency often hide?', 'Preprocessing and CPU-GPU transfers, not the model.'],
          ],
          prereqs: ['Training a detector on a custom dataset'],
        },
        {
          title: 'Monitoring vision models in production',
          description: 'Detecting drift in image statistics, lighting and camera changes, logging low-confidence samples for relabelling, and closing the loop with periodic retraining and shadow evaluation.',
          concepts: ['Image statistic drift', 'Confidence-based sampling', 'Retraining loops', 'Shadow deployment'],
          quiz: [
            ['What is a simple drift signal for images?', 'A shift in brightness, contrast or embedding distribution over time.'],
            ['Why sample low-confidence images?', 'They are the most informative examples to label next.'],
          ],
          prereqs: ['Real-time video pipelines'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: image classifier with transfer learning',
          description: 'Fine-tune a pretrained ResNet or EfficientNet on a small custom dataset, use augmentation and a cosine schedule, report accuracy with a confusion matrix and Grad-CAM, and export to ONNX with a script that runs on a folder.',
          concepts: ['Collect and split the data', 'Fine-tune with augmentation', 'Evaluate and explain errors', 'Export and script inference'],
          quiz: [
            ['What is the first baseline to record?', 'Frozen backbone with a linear head.'],
            ['Why show Grad-CAM in the write-up?', 'It reveals shortcuts like backgrounds being used for classification.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: custom object detector',
          description: 'Label a few hundred images in CVAT for two or three classes, train an Ultralytics YOLO model, evaluate mAP per class, run it on a webcam stream with a tracker, and document what failed and why.',
          concepts: ['Label and export in YOLO format', 'Train and tune the detector', 'Evaluate mAP and failure cases', 'Run on live video'],
          quiz: [
            ['How do you validate labels before training?', 'Draw a sample of boxes back onto images and inspect them.'],
            ['Why report per-class mAP?', 'A high average can hide one class that never works.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: background removal service',
          description: 'Build a segmentation model or use SAM plus a matting refinement to cut subjects from photos, expose it as an API that returns a PNG with alpha, and measure IoU and edge quality on a held-out set.',
          concepts: ['Choose a segmentation approach', 'Refine mask edges', 'Serve as an API with alpha output', 'Measure mask quality'],
          quiz: [
            ['Why is hair a hard case for masks?', 'Thin, semi-transparent structures need soft alpha, not a binary mask.'],
            ['What format preserves transparency?', 'PNG with an alpha channel.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: CLIP-powered image search',
          description: 'Embed a photo collection with CLIP, store vectors in FAISS, support text and image queries, add zero-shot tag suggestions, and build a small web UI that returns results in under a second.',
          concepts: ['Embed and index the collection', 'Text and image query paths', 'Zero-shot tagging', 'Build the search UI'],
          quiz: [
            ['Why normalise embeddings before indexing?', 'So inner product equals cosine similarity.'],
            ['What makes queries fast at scale?', 'An approximate nearest-neighbour index such as FAISS.'],
          ],
          style: 'project',
        },
        {
          title: 'Computer vision interview questions',
          description: 'Receptive fields and output sizes, why ResNets train, one-stage versus two-stage detectors, how NMS and mAP work, CNN versus ViT trade-offs, and how to handle small data and class imbalance.',
          concepts: ['Architecture questions', 'Detection and segmentation questions', 'Metric questions', 'Data and deployment questions'],
          quiz: [
            ['Explain IoU in one sentence.', 'Area of overlap divided by area of union between two regions.'],
            ['Why might a ViT underperform a CNN on 5,000 images?', 'It lacks the locality bias and needs more data unless heavily pretrained.'],
          ],
          style: 'reading',
        },
        {
          title: 'Practical vision coding exercises',
          description: 'Implement IoU and NMS in NumPy, compute conv output shapes by hand, write a Dataset class with augmentation, and debug a training run whose loss is flat or whose validation accuracy is stuck at chance.',
          concepts: ['Implement IoU and NMS', 'Shape arithmetic drills', 'Write a Dataset with transforms', 'Debug a stuck training run'],
          quiz: [
            ['Validation accuracy is exactly chance; what do you check first?', 'That labels align with images and the head outputs the right number of classes.'],
            ['Complexity of naive NMS over n boxes?', 'O(n^2).'],
          ],
          style: 'code',
        },
      ],
    },
  ],
})
