const incotermDetails = {
    EXW: {
        fullName: "Ex Works / 工厂交货",
        riskTransfer: "卖方在工厂交货时，风险转移给买方",
        costs: {
            originToExportPort: "买方",
            exportPortCharges: "买方",
            exportCustomsClearance: "买方",
            exportCustomsFees: "买方",
            freightToDestination: "买方",
            insurance: "买方",
            importCustomsClearance: "买方",
            importCustomsFees: "买方",
            importPortCharges: "买方",
            importDuties: "买方",
            destinationDelivery: "买方"
        }
    },
    // ... 其他贸易术语的详细信息 ...
};

document.addEventListener('DOMContentLoaded', () => {
    const currencyConverter = document.getElementById('currency-converter');
    const weightCalculator = document.getElementById('weight-calculator');
    
    // 创建汇率转换器
    const converterHTML = `
        <h2>汇率转换器</h2>
        <div class="converter-row">
            <input type="number" id="amount" value="1" placeholder="输入金额">
            <select id="fromCurrency">
                <option value="USD" selected>美元 (USD)</option>
                <option value="CNY">人民币 (CNY)</option>
                <option value="EUR">欧元 (EUR)</option>
                <option value="GBP">英镑 (GBP)</option>
                <option value="JPY">日元 (JPY)</option>
                <option value="HKD">港币 (HKD)</option>
                <option value="AUD">澳元 (AUD)</option>
                <option value="CAD">加拿大元 (CAD)</option>
                <option value="SGD">新加坡元 (SGD)</option>
                <option value="KRW">韩元 (KRW)</option>
                <option value="THB">泰铢 (THB)</option>
                <option value="CHF">瑞士法郎 (CHF)</option>
                <option value="NZD">新西兰元 (NZD)</option>
            </select>
            <button id="swap-currencies" title="交换货币">⇄</button>
            <select id="toCurrency">
                <option value="CNY" selected>人民币 (CNY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="EUR">欧元 (EUR)</option>
                <option value="GBP">英镑 (GBP)</option>
                <option value="JPY">日元 (JPY)</option>
                <option value="HKD">港币 (HKD)</option>
                <option value="AUD">澳元 (AUD)</option>
                <option value="CAD">加拿大元 (CAD)</option>
                <option value="SGD">新加坡元 (SGD)</option>
                <option value="KRW">韩元 (KRW)</option>
                <option value="THB">泰铢 (THB)</option>
                <option value="CHF">瑞士法郎 (CHF)</option>
                <option value="NZD">新西兰元 (NZD)</option>
            </select>
        </div>
        <p id="result"></p>
        <div id="common-currencies-selector">
            <h3>选择常用币种</h3>
            <div id="currency-checkboxes"></div>
        </div>
        <div id="common-currencies">
            <h3>常用币种汇率</h3>
            <div id="common-currencies-results"></div>
        </div>
    `;
    
    currencyConverter.innerHTML = converterHTML;
    
    // 创建常用币种选择器
    const currencyCheckboxes = document.getElementById('currency-checkboxes');
    const allCurrencies = ['USD', 'CNY', 'EUR', 'GBP', 'JPY', 'HKD', 'AUD', 'CAD', 'SGD', 'KRW', 'THB', 'CHF', 'NZD'];
    allCurrencies.forEach(currency => {
        const currencyOption = document.createElement('div');
        currencyOption.className = 'currency-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox-${currency}`;
        checkbox.value = currency;
        checkbox.checked = ['USD', 'EUR', 'GBP', 'JPY', 'HKD', 'AUD', 'CAD'].includes(currency);
        
        const label = document.createElement('label');
        label.htmlFor = `checkbox-${currency}`;
        label.textContent = currency;
        
        currencyOption.appendChild(checkbox);
        currencyOption.appendChild(label);
        currencyCheckboxes.appendChild(currencyOption);
    });
    
    // 修改转换功能
    const convertCurrency = async () => {
        const amount = document.getElementById('amount').value;
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        
        try {
            const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
            const data = await response.json();
            
            if (data.result === "success") {
                const rate = data.rates[toCurrency];
                const convertedAmount = amount * rate;
                const resultElement = document.getElementById('result');
                resultElement.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
                
                // 添加高亮动画
                resultElement.classList.remove('highlight');
                void resultElement.offsetWidth; // 触发重排
                resultElement.classList.add('highlight');
                
                // 更新常用币种汇率
                updateCommonCurrencies(amount, fromCurrency, data.rates);
            } else {
                throw new Error('无法获取汇率数据');
            }
        } catch (error) {
            console.error('获取汇率时错误:', error);
            document.getElementById('result').textContent = '获取汇率失败，请稍后再试';
        }
    };

    // 更新常用币种汇率
    const updateCommonCurrencies = (amount, fromCurrency, rates) => {
        const commonCurrenciesResults = document.getElementById('common-currencies-results');
        commonCurrenciesResults.innerHTML = '';
        
        allCurrencies.forEach(currency => {
            const checkbox = document.getElementById(`checkbox-${currency}`);
            if (checkbox.checked && currency !== fromCurrency) {
                const rate = rates[currency];
                const convertedAmount = (amount * rate).toFixed(2);
                const resultP = document.createElement('p');
                resultP.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${currency}`;
                commonCurrenciesResults.appendChild(resultP);
            }
        });
    };

    // 添加事件监听器，实现自转换
    document.getElementById('amount').addEventListener('input', convertCurrency);
    document.getElementById('fromCurrency').addEventListener('change', convertCurrency);
    document.getElementById('toCurrency').addEventListener('change', convertCurrency);

    // 当选择常用币种变化时，重新计算
    currencyCheckboxes.addEventListener('change', convertCurrency);

    // 页面加载时自动执行一次转换
    convertCurrency();

    // 创建实重/抛重计算器
    const weightCalculatorHTML = `
        <h2>实重/抛重计算器</h2>
        <div class="weight-calculator-row">
            <input type="number" id="length" placeholder="长度 (cm)">
            <input type="number" id="width" placeholder="宽度 (cm)">
            <input type="number" id="height" placeholder="高度 (cm)">
            <input type="number" id="actual-weight" placeholder="实际重量 (kg)">
        </div>
        <button id="calculate-weight">计算</button>
        <p id="weight-result"></p>
    `;

    weightCalculator.innerHTML = weightCalculatorHTML;

    // 添加计算功能
    const calculateWeightBtn = document.getElementById('calculate-weight');
    calculateWeightBtn.addEventListener('click', () => {
        const length = parseFloat(document.getElementById('length').value);
        const width = parseFloat(document.getElementById('width').value);
        const height = parseFloat(document.getElementById('height').value);
        const actualWeight = parseFloat(document.getElementById('actual-weight').value);

        if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(actualWeight)) {
            document.getElementById('weight-result').textContent = "请输入有效的数值";
            return;
        }

        const volumetricWeight = (length * width * height) / 5000;
        const resultElement = document.getElementById('weight-result');

        if (volumetricWeight > actualWeight) {
            resultElement.textContent = `计算结果: 按抛重计算, ${volumetricWeight.toFixed(2)} kg`;
        } else {
            resultElement.textContent = `计算结果: 按实重计算, ${actualWeight.toFixed(2)} kg`;
        }
    });

    // 添加交换货币功能
    const swapCurrenciesBtn = document.getElementById('swap-currencies');
    swapCurrenciesBtn.addEventListener('click', () => {
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        convertCurrency();
    });

    // 页面加载时自动执行一次转换
    convertCurrency();
});