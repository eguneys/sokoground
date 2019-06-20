import NetworkFactory from './factory';

function TransposeTensor(dims, order, from, to) {
  if (order.length === 0) {
    for (var i = 0; i < dims.length; i++) {
      order.push(dims.length - i - 1);
    }
  }

  const curIdx = [];
  for (var j = 0; j < dims.length; j++) {
    curIdx[j] = 0;
  }

  var toIdx = 0;
  for (var _ = 0; _ < from.length; _++) {
    var fromIdx = 0;
    for (i of order) {
      fromIdx *= dims[i];
      fromIdx += curIdx[i];
    }
    to[toIdx++] = from[fromIdx];
    for (i = dims.length - 1; i >= 0; --i) {
      curIdx[i] = curIdx[i] + 1;
      if (curIdx[i] === dims[i]) {
        curIdx[i] = 0;
      } else {
        break;
      }
    }
  }
}



function MakeConst(shape, values, order) {
  let tensorBuffer = tf.buffer(shape);
  let dims = [];
  for (const x of shape) {
    dims.push(x);
  }

  TransposeTensor(dims, order, values, tensorBuffer.values);

  return tensorBuffer.toTensor();
}

function MakeVals(shape, val) {
  let tensorBuffer = tf.buffer(shape);

  var numElements = shape.reduce(_ => _+_);

  for (var i = 0; i < numElements; i++) {
    tensorBuffer.values[i] = val;
  }

  return tensorBuffer.toTensor();
}

function Zeros(shape) {
  return MakeVals(shape, 0);
}

function Ones(shape) {
  return MakeVals(shape, 1);
}

function MakeConvBlock(input, channels, inputChannels, outputChannels, weights, mixin) {
  
  const kDataFormat = "NHWC";

  let wConv = MakeConst([channels, channels, inputChannels, outputChannels], weights.weights, [3, 2, 0, 1]);

  let bConv = MakeConst([outputChannels], weights.biases);
  let conv2d = Conv2D(input, wConv, [1,1,1,1], "SAME",
                      Conv2D.DataFormat(kDataFormat).Dilations([1,1,1,1]));
  
  let bnMeans = MakeConst([outputChannels], weights.bnMeans);
  let means = Sub(bnMeans, bConv);

  let batchNorm = FusedBatchNorm(
    scope, conv2d, Ones([outputChannels]),
    Zeros([outputChannels]), means,
    MakeConst([outputChannels], weights.bnStdDivs),
    FusedBatchNorm.DataFormat(kDataFormat)
      .isTraining(false)).y;

  if (mixin) {
    batchNorm = Add(batchNorm, mixin);
  }

  return Relu(batchNorm);

}

function MakeResidualBlock(input, channels, weights) {
  let block1 =
      MakeConvBlock(input, 3, channels, channels, weights.conv1);
  let block2 =
      MakeConvBlock(block1, 3, channels, channels, weights.conv2, input);

  return block2;
}

function MakeNetwork(input, weights) {
  const filters = weights.input.weights.length / kInputPlanes / 9;

  let flow = MakeConvBlock(input,
                           3,
                           kInputPlanes,
                           filters,
                           weights.input);

  for (const block of weights.residual) {
    flow = MakeResidualBlock(flow,
                             filters,
                             block);
  }
  
  // policy head
  const convPol = MakeConvBlock(flow,
                                1,
                                filters,
                                32,
                                weights.policy);

  convPol = Reshape(convPol, Const([-1, 32 * 8 * 8]));

  let ipPolW = MakeConst([8, 8, 32, 1858], weights.ipPolW, [3, 2, 0, 1]);
  ipPolW = Reshape(ipPolW, Const([32 * 8 * 8, 1858]));
  let ipPolB = MakeConst([1858], weights.ipPolB);
  let policyFc = Add(MatMul(convPol, ipPolW), ipPolB);
  let policyHead = Softmax(policyFc);


  // value head
  let convVal = MakeConvBlock(flow, 1, filters, 32, weights.value);
  convVal = Reshape(convVal, Const([-1, 32 * 8 * 8]));

  let ip1ValW = MakeConst([8, 8, 32, 128], weights.ip1ValW, [3, 2, 0, 1]);
  ip1ValW = Reshape(ip1ValW, Const([32 * 8 * 8, 128]));
  let ip1ValB = MakeConst([128], weights.ip1ValB);
  let valueFlow = Relu(Add(MatMul(convVal, ip1ValW), ip1ValB));
  let ip2ValW = MakeConst([128, 1], weights.ip2ValW);
  let ip2ValB = MakeConst([1], weights.ip2ValB);
  let valueHead = Tanh(Add(MatMul(valueFlow, ip2ValW), ip2ValB));

  return { first: policyHead, second: valueHead };

}

function TFNetworkComputation(network) {

  let input,
      output = [],
      status;


  this.addInput = (input) => {
    rawInput.push(input);
  };

  this.computeBlocking = () => {
    prepareInput();
    status = network.compute(input, output);
  };

  this.getQVal = (sample) => {
    return output[0].template(sample, 0);
  };

  this.getPVal = (sample, moveId) => {
    return output[1].template(sample, moveId);
  };

  const prepareInput = () => {
    input = new Tensor();
    
  };
}

function TFNetwork(file, options) {
  
  const input = new Placeholder();

  const weights = file.weights();
  const output = MakeNetwork(input, weights);
  const policyHead = new Output(output.first),
        valueHead = new Output(output.second);

  this.compute = (input_, outputs) => {
    return session.Run({ input, input_ },
                       { valueHead, policyHead },
                       outputs);
  };

  this.newComputation = () => {
    return new TFNetworkComputation(this);
  };
}

function makeTFNetwork(weights, options) {
  return new TFNetwork(weights, options);
}

NetworkFactory.Get().RegisterNetwork("tensorflow", makeTFNetwork);
