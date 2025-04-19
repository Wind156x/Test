import { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/ui/select";

export default function ExpenseTracker() {
  let [items, setItems] = useState([]);
  let [desc, setDesc] = useState("");
  let [amount, setAmount] = useState("");
  let [customDesc, setCustomDesc] = useState("");
  let [selectedMonth, setSelectedMonth] = useState("01");
  let [descOptions, setDescOptions] = useState([
    "รายรับ",
    "ค่าบัตร",
    "ค่าห้อง",
    "ค่าห้อง - ค่าน้ำ",
    "ค่าห้อง - ค่าไฟ",
    "ค่าห้อง - ค่าเน็ต",
    "ให้แม่",
    "กองกลาง",
    "ใช้จ่ายส่วนตัว",
    "ออมสหกรณ์ปราสาท",
    "ทำบุญ",
    "ออมไว้สำรอง"
  ]);
  let [isCustom, setIsCustom] = useState(false);
  let [showAddItemForm, setShowAddItemForm] = useState(false);
  let [confirmDelete, setConfirmDelete] = useState("");

  let predefinedAmounts = {
    "ค่าห้อง": 3000,
    "ค่าห้อง - ค่าเน็ต": 320,
    "ให้แม่": 1000,
    "กองกลาง": 2000,
    "ออมสหกรณ์ปราสาท": 500,
    "ทำบุญ": 200
  };

  let monthsInThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  useEffect(() => {
    const savedItems = localStorage.getItem("expenseItems");
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  let addItem = (repeatAllMonths = false) => {
    let finalDesc = isCustom ? customDesc : desc;
    if (!finalDesc || !amount) return;
    let baseItem = { desc: finalDesc, amount: parseFloat(amount), isChecked: false };

    let newItems = repeatAllMonths
      ? monthsInThai.map((_, index) => ({ ...baseItem, month: (index + 1).toString().padStart(2, '0') }))
      : [{ ...baseItem, month: selectedMonth }];

    let updatedItems = [...items, ...newItems];
    setItems(updatedItems);
    localStorage.setItem("expenseItems", JSON.stringify(updatedItems));

    if (isCustom && !descOptions.includes(customDesc)) {
      setDescOptions([...descOptions, customDesc]);
    }

    setDesc("");
    setCustomDesc("");
    setAmount("");
    setIsCustom(false);
    setShowAddItemForm(false);
  };

  let handleSelectChange = (value) => {
    if (value === "อื่นๆ") {
      setIsCustom(true);
      setDesc("");
      setAmount("");
    } else {
      setIsCustom(false);
      setDesc(value);
      setAmount(predefinedAmounts[value]?.toString() || "");
    }
  };

  let cancelItem = (idx) => {
    let updatedItems = items.filter((_, i) => i !== idx || items[idx].month !== selectedMonth);
    setItems(updatedItems);
    localStorage.setItem("expenseItems", JSON.stringify(updatedItems));
  };

  let monthlyItems = items.filter(item => item.month === selectedMonth);

  let incomeTotal = monthlyItems.filter(item => item.desc === "รายรับ").reduce((acc, item) => acc + item.amount, 0);
  let expenseTotal = monthlyItems.filter(item => item.desc !== "รายรับ").reduce((acc, item) => acc + item.amount, 0);

  let isChecklistComplete = monthlyItems.every(item => item.isChecked);

  let openKrungthaiApp = () => {
    window.location.href = "krungthai://";
  };

  let clearAll = () => {
    setItems([]);
    localStorage.removeItem("expenseItems");
    setConfirmDelete("");
  };

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="text-lg font-bold">รายรับ-รายจ่าย</div>
          <Select onValueChange={setSelectedMonth} value={selectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกเดือน" />
            </SelectTrigger>
            <SelectContent>
              {monthsInThai.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString().padStart(2, '0')}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddItemForm(true)} className="w-full mt-2">เพิ่มรายการ</Button>
        </CardContent>
      </Card>

      {showAddItemForm && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="text-lg font-bold">บันทึกรายการ</div>
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                {descOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
                <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
            {isCustom && (
              <Input
                placeholder="ระบุรายการใหม่"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
              />
            )}
            <Input
              placeholder="จำนวนเงิน"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div className="flex gap-2 justify-between">
              <Button onClick={() => addItem(false)} disabled={!amount || (!desc && !customDesc)} className="w-1/2">
                บันทึก
              </Button>
              <Button
                onClick={() => setShowAddItemForm(false)}
                variant="outline"
                className="w-1/2"
              >
                ยกเลิก
              </Button>
            </div>
            <div className="flex gap-2 justify-between mt-2">
              <Button
                onClick={() => addItem(true)}
                disabled={!amount || (!desc && !customDesc)}
                variant="outline"
                className="w-1/2"
              >
                เพิ่มทุกเดือน
              </Button>
              <Button
                onClick={() => setConfirmDelete("confirm")}
                variant="outline"
                className="w-1/2 text-gray-400"
              >
                ล้างข้อมูลทั้งหมด
              </Button>
            </div>
            {confirmDelete === "confirm" && (
              <div className="mt-2 flex flex-col items-center">
                <span className="text-red-500">แน่ใจว่าต้องการล้างข้อมูล?</span>
                <div className="flex gap-2 mt-1">
                  <Button onClick={clearAll} className="bg-red-500 text-white">ยืนยัน</Button>
                  <Button onClick={() => setConfirmDelete("")} variant="outline">ยกเลิก</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">
              รายการเดือน {monthsInThai[parseInt(selectedMonth) - 1]}
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                isChecklistComplete ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isChecklistComplete ? 'เสร็จสมบูรณ์' : 'ยังไม่เสร็จ'}
            />
          </div>
          {monthlyItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center">
                <Button
                  onClick={() => openKrungthaiApp()}
                  className={`mr-2 ${item.isChecked ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} p-2`}
                >
                  {item.isChecked ? "โอนแล้ว" : "ยังไม่โอน"}
                </Button>
                <span>{item.desc}</span>
              </div>
              <div className="flex items-center">
                <span>{item.amount.toFixed(2)}</span>
                <Button
                  onClick={() => cancelItem(idx)}
                  className="ml-2 bg-red-500 text-white p-2 text-sm"
                >
                  ลบ
                </Button>
              </div>
            </div>
          ))}
          <div className="border-t mt-2 pt-2">
            <div className="flex justify-between">
              <span className="font-bold">รายรับรวม</span>
              <span>{incomeTotal.toFixed(2)} บาท</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">รายจ่ายรวม</span>
              <span>{expenseTotal.toFixed(2)} บาท</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>ยอดสุทธิ</span>
              <span>{(incomeTotal - expenseTotal).toFixed(2)} บาท</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}